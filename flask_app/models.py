
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Sample(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    barcode = db.Column(db.String(10), unique=True, nullable=False)
    ltx_id = db.Column(db.String(10))
    patient_id = db.Column(db.String(10), nullable=False)
    parent_barcode = db.Column(db.String(10))
    type = db.Column(db.String(20), nullable=False)
    investigation_type = db.Column(db.String(50))
    status = db.Column(db.String(20))
    site = db.Column(db.String(50))
    timepoint = db.Column(db.String(100))
    specimen = db.Column(db.String(50))
    spec_number = db.Column(db.String(10))
    material = db.Column(db.String(20))
    sample_date = db.Column(db.Date)
    sample_time = db.Column(db.Time)
    freezer = db.Column(db.String(20))
    shelf = db.Column(db.String(20))
    box = db.Column(db.String(20))
    position = db.Column(db.String(20))
    volume = db.Column(db.Float)
    amount = db.Column(db.Float)
    concentration = db.Column(db.Float)
    mass = db.Column(db.Float)
    surplus = db.Column(db.Boolean, default=False)
    sample_level = db.Column(db.String(20))
    comments = db.Column(db.Text)
