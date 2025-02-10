
INVESTIGATION_TYPES = [
    'Sequencing',
    'PDX',
    'Single Cell Analysis',
    'Organoids',
    'Cell of Origin',
    'Tissue Culture',
    'Immunology',
    'cfDNA/Sequencing',
    'Immune Analysis'
]

SITES = [
    'UCLH',
    'Manchester',
    'Birmingham',
    'Aberdeen',
    'Leicester',
    'North Midd',
    'Rayal Free',
    'Whittington',
    'Cardiff',
    'Princess Alexandra',
    "St. Peter's",
    'Royal Brompton',
    'Southampton',
    'Sheffield',
    'Liverpool',
    'Barts',
    'Glasgow'
]

# Add other constants as needed

def get_next_barcode(existing_barcodes):
    numbers = [int(code) for code in existing_barcodes if code.isdigit()]
    max_number = max([0] + numbers)
    next_number = max_number + 1
    return str(next_number).zfill(6)
