"""Database engine and portable schema initialization for PostgreSQL and SQLite."""
from __future__ import annotations
import os
import uuid
import json
from datetime import datetime, date
from functools import lru_cache
from sqlalchemy import create_engine, text, inspect

DEFAULT_DB_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "verity.db"))


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        return f"sqlite:///{DEFAULT_DB_FILE}"
    # Standardize Postgres psycopg driver if needed
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


@lru_cache
def get_engine():
    url = get_database_url()
    try:
        if url.startswith("sqlite"):
            engine = create_engine(url, connect_args={"check_same_thread": False})
        else:
            engine = create_engine(url, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine
    except Exception as e:
        # Fall back to SQLite if remote Postgres is not reachable
        fallback_url = f"sqlite:///{DEFAULT_DB_FILE}"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        return engine


def init_db():
    engine = get_engine()
    is_sqlite = engine.url.drivername.startswith("sqlite")
    
    with engine.begin() as conn:
        if is_sqlite:
            # Create SQLite tables
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS organisations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL REFERENCES organisations(id),
                display_name TEXT NOT NULL,
                email TEXT,
                role TEXT NOT NULL CHECK (role IN ('admin','creator','reviewer')),
                blocked INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL REFERENCES organisations(id),
                title TEXT NOT NULL,
                category TEXT DEFAULT 'Policy',
                created_by TEXT REFERENCES profiles(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (org_id, title)
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS document_versions (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                org_id TEXT NOT NULL,
                version TEXT NOT NULL,
                effective_date TEXT,
                review_date TEXT,
                status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','superseded','archived')),
                storage_path TEXT,
                body TEXT NOT NULL,
                uploaded_by TEXT REFERENCES profiles(id),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS guidelines (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL REFERENCES organisations(id),
                kind TEXT NOT NULL CHECK (kind IN ('banned','required')),
                value TEXT NOT NULL,
                reason TEXT,
                platform TEXT DEFAULT 'Any'
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS submissions (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL REFERENCES organisations(id),
                creator_id TEXT NOT NULL REFERENCES profiles(id),
                title TEXT NOT NULL,
                context TEXT NOT NULL,
                deadline TEXT,
                status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','revision','rejected')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS submission_versions (
                id TEXT PRIMARY KEY,
                submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
                org_id TEXT NOT NULL,
                n INTEGER NOT NULL,
                body TEXT NOT NULL,
                findings TEXT NOT NULL,
                risk TEXT NOT NULL,
                ai TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (submission_id, n)
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS decisions (
                id TEXT PRIMARY KEY,
                submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
                org_id TEXT NOT NULL,
                reviewer_id TEXT NOT NULL REFERENCES profiles(id),
                version_n INTEGER NOT NULL,
                action TEXT NOT NULL CHECK (action IN ('approved','revision','rejected')),
                genuineness TEXT NOT NULL CHECK (genuineness IN ('Genuine','Misleading','Cannot determine')),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS impacts (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
                document_id TEXT REFERENCES documents(id),
                old_text TEXT,
                sentence TEXT,
                location TEXT,
                status TEXT DEFAULT 'open' CHECK (status IN ('open','resolved')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                user_id TEXT,
                role TEXT,
                message TEXT NOT NULL,
                read_by TEXT DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                actor_id TEXT,
                action TEXT NOT NULL,
                detail TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"""))
            
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                UNIQUE (org_id, key)
            );"""))
        else:
            # PostgreSQL schema is already provided in migrations/001_schema.sql
            pass

    # Ensure baseline seed organization exists
    seed_demo_data_if_empty()


def seed_demo_data_if_empty():
    engine = get_engine()
    with engine.begin() as conn:
        has_org = conn.execute(text("SELECT id FROM organisations LIMIT 1")).first()
        if has_org:
            return
            
        org_id = "org-verity-demo"
        conn.execute(text("INSERT INTO organisations (id, name) VALUES (:id, :name)"),
                     {"id": org_id, "name": "Acme Global Technologies"})
        
        # Create standard demo profiles for all 3 roles
        admin_id = "user-admin-01"
        creator_id = "user-creator-01"
        reviewer_id = "user-reviewer-01"
        
        conn.execute(text("""
            INSERT INTO profiles (id, org_id, display_name, email, role, blocked)
            VALUES 
                (:admin_id, :org_id, 'Rohith (Administrator)', 'rohith@verity.acme.com', 'admin', 0),
                (:creator_id, :org_id, 'Marcus Vance', 'creator@verity.acme.com', 'creator', 0),
                (:reviewer_id, :org_id, 'Elena Rostova', 'reviewer@verity.acme.com', 'reviewer', 0)
        """), {
            "org_id": org_id,
            "admin_id": admin_id,
            "creator_id": creator_id,
            "reviewer_id": reviewer_id
        })
        
        # Seed approved documents: Warranty Policy & Product Specifications
        doc1_id = "doc-warranty-01"
        doc2_id = "doc-specs-01"
        
        conn.execute(text("""
            INSERT INTO documents (id, org_id, title, category, created_by)
            VALUES 
                (:d1, :org_id, 'Standard Product Warranty Policy', 'Legal & Compliance', :admin_id),
                (:d2, :org_id, 'Apex X1 Technical Specifications', 'Product Engineering', :admin_id)
        """), {"d1": doc1_id, "d2": doc2_id, "org_id": org_id, "admin_id": admin_id})
        
        warranty_text = (
            "All Apex X1 hardware products purchased from authorized retailers include a 2 year limited manufacturer warranty. "
            "The warranty covers defects in materials and workmanship under normal use. "
            "The warranty does not cover accidental damage, liquid ingress, or unauthorized modifications. "
            "Battery replacement service is provided free of charge for the first 12 months if capacity drops below 80 percent."
        )
        
        specs_text = (
            "The Apex X1 laptop is engineered with ultra-efficient architecture. "
            "The battery delivers up to 14 hours of continuous web browsing on a single charge. "
            "Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter. "
            "The chassis is constructed from 100 percent recycled aerospace-grade aluminum and weighs 1.28 kg. "
            "Operating acoustic noise remains strictly below 24 decibels under standard office workloads."
        )
        
        conn.execute(text("""
            INSERT INTO document_versions (id, document_id, org_id, version, effective_date, review_date, status, body, uploaded_by)
            VALUES 
                (:v1, :d1, :org_id, '2.0', '2025-01-01', '2027-01-01', 'approved', :w_body, :admin_id),
                (:v2, :d2, :org_id, '1.4', '2025-02-15', '2026-12-31', 'approved', :s_body, :admin_id)
        """), {
            "v1": "ver-warranty-2.0",
            "d1": doc1_id,
            "org_id": org_id,
            "w_body": warranty_text,
            "admin_id": admin_id,
            "v2": "ver-specs-1.4",
            "d2": doc2_id,
            "s_body": specs_text
        })
        
        # Seed Superseded Version (Warranty 1.0 which had 3 year warranty) to test outdated detection and change impact!
        old_warranty_text = (
            "All Apex hardware products include an unconditional 3 year limited warranty. "
            "Battery replacement is covered for 24 months. "
            "Warranty does not cover accidental damage."
        )
        conn.execute(text("""
            INSERT INTO document_versions (id, document_id, org_id, version, effective_date, review_date, status, body, uploaded_by)
            VALUES (:v_old, :d1, :org_id, '1.0', '2023-01-01', '2024-12-31', 'superseded', :old_body, :admin_id)
        """), {
            "v_old": "ver-warranty-1.0",
            "d1": doc1_id,
            "org_id": org_id,
            "old_body": old_warranty_text,
            "admin_id": admin_id
        })
        
        # Seed Brand Guidelines
        conn.execute(text("""
            INSERT INTO guidelines (id, org_id, kind, value, reason, platform)
            VALUES 
                (:g1, :org_id, 'banned', 'unbeatable', 'Unsubstantiated superlative prohibited by legal compliance.', 'Any'),
                (:g2, :org_id, 'banned', '100% unbreakable', 'Absolute claim creating product liability risk.', 'Any'),
                (:g3, :org_id, 'required', 'Terms and conditions apply.', 'Mandatory statutory disclaimer for promotional campaigns.', 'Any'),
                (:g4, :org_id, 'required', 'Subject to network availability.', 'Mandatory disclaimer for cellular devices.', 'Website')
        """), {
            "g1": "guide-01",
            "g2": "guide-02",
            "g3": "guide-03",
            "g4": "guide-04",
            "org_id": org_id
        })
        
        # Seed Audit Logs
        conn.execute(text("""
            INSERT INTO audit_logs (id, org_id, actor_id, action, detail)
            VALUES 
                (:a1, :org_id, :admin_id, 'System Initialized', 'Acme Global Technologies organisation provisioned'),
                (:a2, :org_id, :admin_id, 'Approved Document', 'Standard Product Warranty Policy v2.0'),
                (:a3, :org_id, :admin_id, 'Approved Document', 'Apex X1 Technical Specifications v1.4'),
                (:a4, :org_id, :admin_id, 'Added Guideline', 'Prohibited term: unbeatable')
        """), {
            "a1": "audit-01",
            "a2": "audit-02",
            "a3": "audit-03",
            "a4": "audit-04",
            "org_id": org_id,
            "admin_id": admin_id
        })
        
        # Seed Notifications
        conn.execute(text("""
            INSERT INTO notifications (id, org_id, user_id, role, message)
            VALUES 
                (:n1, :org_id, NULL, 'reviewer', 'Welcome to VERITY. Authoritative Knowledge Base documents are indexed and ready.'),
                (:n2, :org_id, NULL, 'admin', 'Brand governance baseline active with 2 approved policies and 4 guidelines.')
        """), {
            "n1": "note-01",
            "n2": "note-02",
            "org_id": org_id
        })
