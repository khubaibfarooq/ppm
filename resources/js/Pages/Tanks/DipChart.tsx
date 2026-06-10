import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Form } from 'react-bootstrap';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface DipPoint {
  id: number;
  dip_mm: number;
  liters: number;
}

interface Props {
  tank: any;
  dipChart: DipPoint[];
}

const DipChart = ({ tank, dipChart }: Props) => {
  const [points, setPoints] = useState<Omit<DipPoint, 'id'>[]>(
    dipChart.map(p => ({ dip_mm: p.dip_mm, liters: p.liters }))
  );

  const { data, setData, post, processing } = useForm({
    chart_data: points,
  });

  const handleAddRow = () => {
    const newPoints = [...points, { dip_mm: 0, liters: 0 }].sort((a, b) => a.dip_mm - b.dip_mm);
    setPoints(newPoints);
    setData('chart_data', newPoints);
  };

  const handleRemoveRow = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    setData('chart_data', newPoints);
  };

  const handleValChange = (index: number, field: 'dip_mm' | 'liters', val: number) => {
    const newPoints = [...points];
    newPoints[index] = {
      ...newPoints[index],
      [field]: val,
    };
    setPoints(newPoints);
    setData('chart_data', newPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('tanks.dip-chart.save', tank.id));
  };

  // CSV Import parser (mm,liters per line)
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsedPoints: Omit<DipPoint, 'id'>[] = [];
      const lines = text.split('\n');

      for (let line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          const mm = parseInt(parts[0].trim());
          const liters = parseFloat(parts[1].trim());
          if (!isNaN(mm) && !isNaN(liters)) {
            parsedPoints.push({ dip_mm: mm, liters });
          }
        }
      }

      const sorted = parsedPoints.sort((a, b) => a.dip_mm - b.dip_mm);
      setPoints(sorted);
      setData('chart_data', sorted);
    };
    reader.readAsText(file);
  };

  return (
    <React.Fragment>
      <Head title={`Dip Chart Calibration | ${tank.name}`} />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dip Chart Calibration" pageTitle="Inventory" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-dark fw-bold">{tank.name} <span className="text-muted">({tank.product.name})</span></h5>
                <p className="text-muted mb-0 fs-12">Calibrate mm heights to liters capacity for linear interpolation calculations</p>
              </div>
              <Link href={route('tanks.index')}>
                <Button variant="light">
                  <i className="ri-arrow-left-line align-middle me-1"></i> Back to Tanks
                </Button>
              </Link>
            </Col>
          </Row>

          <Row>
            {/* Import options */}
            <Col lg={4} className="mb-4">
              <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Import CSV Calibration Chart</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label className="fs-12 fw-medium text-muted">Select CSV file (format: mm, liters per line)</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                    />
                  </Form.Group>
                  <p className="fs-12 text-muted mt-2">
                    <i className="ri-information-line align-middle me-1"></i>
                    Uploading a CSV file will automatically populate the table and replace the existing calibration table values.
                  </p>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold text-info">Interpolation Preview</h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted fs-12">Linear interpolation computes matching liter contents for any height dip in millimeters. It locates the closest mapping points in the calibration table and calculates the volume accurately.</p>
                </Card.Body>
              </Card>
            </Col>

            {/* Dip Chart Table Form */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 fw-bold">Calibration Points ({points.length})</h5>
                  <Button variant="soft-primary" size="sm" onClick={handleAddRow}>
                    <i className="ri-add-line align-bottom me-1"></i> Add Calibration Point
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <Table bordered hover align="middle" className="mb-0">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th className="text-center" style={{ width: '80px' }}>#</th>
                            <th>Dip Height (mm)</th>
                            <th>Capacity (Liters)</th>
                            <th className="text-center" style={{ width: '80px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {points.map((row, index) => (
                            <tr key={index}>
                              <td className="text-center text-muted font-monospace">{index + 1}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  className="font-monospace text-end"
                                  value={row.dip_mm || ''}
                                  onChange={e => handleValChange(index, 'dip_mm', parseInt(e.target.value) || 0)}
                                  required
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  className="font-monospace text-end"
                                  value={row.liters || ''}
                                  onChange={e => handleValChange(index, 'liters', parseFloat(e.target.value) || 0)}
                                  required
                                />
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => handleRemoveRow(index)}
                                >
                                  <i className="ri-delete-bin-line fs-15"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {points.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center text-muted py-5">No calibration points added. Click "Add Calibration Point" or import a CSV chart.</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>

                    <div className="text-end mt-4">
                      <Button type="submit" variant="success" size="lg" disabled={processing || points.length === 0}>
                        {processing ? 'Saving...' : 'Save Calibration Chart'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

DipChart.layout = (page: any) => <Layout children={page} />;
export default DipChart;
