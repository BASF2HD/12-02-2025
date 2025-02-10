
from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tracerx.db'
db = SQLAlchemy(app)

# Models
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

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/samples', methods=['GET'])
def get_samples():
    samples = Sample.query.all()
    return jsonify([{
        'id': s.id,
        'barcode': s.barcode,
        'patientId': s.patient_id,
        'type': s.type,
        'investigationType': s.investigation_type,
        'status': s.status,
        'site': s.site,
        'timepoint': s.timepoint,
        'specimen': s.specimen,
        'specNumber': s.spec_number,
        'material': s.material,
        'sampleDate': s.sample_date.isoformat() if s.sample_date else None,
        'sampleTime': s.sample_time.isoformat() if s.sample_time else None,
        'freezer': s.freezer,
        'shelf': s.shelf,
        'box': s.box,
        'position': s.position,
        'volume': s.volume,
        'amount': s.amount,
        'concentration': s.concentration,
        'mass': s.mass,
        'surplus': s.surplus,
        'sampleLevel': s.sample_level,
        'comments': s.comments
    } for s in samples])

@app.route('/api/samples', methods=['POST'])
def add_samples():
    samples_data = request.json
    new_samples = []
    
    for sample_data in samples_data:
        sample = Sample(
            id=sample_data.get('id'),
            barcode=sample_data.get('barcode'),
            patient_id=sample_data.get('patientId'),
            type=sample_data.get('type'),
            investigation_type=sample_data.get('investigationType'),
            status=sample_data.get('status'),
            site=sample_data.get('site'),
            timepoint=sample_data.get('timepoint'),
            specimen=sample_data.get('specimen'),
            spec_number=sample_data.get('specNumber'),
            material=sample_data.get('material'),
            sample_date=datetime.strptime(sample_data.get('sampleDate'), '%Y-%m-%d').date(),
            sample_time=datetime.strptime(sample_data.get('sampleTime'), '%H:%M').time(),
            sample_level=sample_data.get('sampleLevel'),
            comments=sample_data.get('comments')
        )
        db.session.add(sample)
        new_samples.append(sample)
    
    db.session.commit()
    return jsonify({'message': 'Samples added successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=3000)
