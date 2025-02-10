
from flask import Flask, render_template, request, jsonify
from models import db, Sample
from constants import *
import uuid
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tracerx.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/samples', methods=['GET'])
def get_samples():
    samples = Sample.query.all()
    return jsonify([{
        'id': s.id,
        'barcode': s.barcode,
        'ltxId': s.ltx_id,
        'patientId': s.patient_id,
        'parentBarcode': s.parent_barcode,
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
            id=str(uuid.uuid4()),
            barcode=sample_data.get('barcode'),
            ltx_id=sample_data.get('ltxId'),
            patient_id=sample_data.get('patientId'),
            parent_barcode=sample_data.get('parentBarcode'),
            type=sample_data.get('type'),
            investigation_type=sample_data.get('investigationType'),
            status=sample_data.get('status'),
            site=sample_data.get('site'),
            timepoint=sample_data.get('timepoint'),
            specimen=sample_data.get('specimen'),
            spec_number=sample_data.get('specNumber'),
            material=sample_data.get('material'),
            sample_date=datetime.strptime(sample_data.get('sampleDate'), '%Y-%m-%d').date() if sample_data.get('sampleDate') else None,
            sample_time=datetime.strptime(sample_data.get('sampleTime'), '%H:%M').time() if sample_data.get('sampleTime') else None,
            freezer=sample_data.get('freezer'),
            shelf=sample_data.get('shelf'),
            box=sample_data.get('box'),
            position=sample_data.get('position'),
            volume=sample_data.get('volume'),
            amount=sample_data.get('amount'),
            concentration=sample_data.get('concentration'),
            mass=sample_data.get('mass'),
            surplus=sample_data.get('surplus', False),
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
