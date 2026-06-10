import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Card, Col, Container, Row, Form, Button, Table } from 'react-bootstrap';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Nozzle {
  id: number;
  label: string;
  machine: { name: string };
  product: { name: string };
  last_reading: number; // Opening reading value
}

interface Tank {
  id: number;
  name: string;
  product: { name: string };
}

interface Props {
  shiftLog: any;
  nozzles: Nozzle[];
  tanks: Tank[];
}

const CloseShift = ({ shiftLog, nozzles, tanks }: Props) => {
  const { data, setData, post, processing, errors } = useForm({
    meter_readings: nozzles.map(n => ({
      nozzle_id: n.id,
      nozzle_label: `${n.machine.name} - ${n.label}`,
      product_name: n.product.name,
      opening: n.last_reading || 0,
      closing: n.last_reading || 0,
    })),
    dip_readings: tanks.map(t => ({
      tank_id: t.id,
      tank_name: t.name,
      product: t.product.name,
      dip_mm: 0,
      water_mm: 0,
    })),
    cash_amount: 0,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('shifts.close', shiftLog.id));
  };

  return (
    <React.Fragment>
      <Head title="Close Shift | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Close Shift" pageTitle="Shifts" />

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Nozzle meter readings */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-primary">Nozzle Closing Readings</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table bordered hover className="align-middle table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Nozzle</th>
                            <th>Product</th>
                            <th className="text-end" style={{ width: '180px' }}>Opening Meter</th>
                            <th className="text-end" style={{ width: '180px' }}>Closing Meter</th>
                            <th className="text-end" style={{ width: '150px' }}>Liters Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.meter_readings.map((row, i) => (
                            <tr key={row.nozzle_id}>
                              <td>{row.nozzle_label}</td>
                              <td>{row.product_name}</td>
                              <td className="text-end text-muted font-monospace">{row.opening.toLocaleString()}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.0001"
                                  className="text-end font-monospace"
                                  value={row.closing || ''}
                                  onChange={e => {
                                    const updated = [...data.meter_readings];
                                    updated[i].closing = parseFloat(e.target.value) || 0;
                                    setData('meter_readings', updated);
                                  }}
                                  required
                                  isInvalid={row.closing < row.opening}
                                />
                                <Form.Control.Feedback type="invalid">Closing reading must be &gt;= opening.</Form.Control.Feedback>
                              </td>
                              <td className="text-end font-monospace text-primary fw-semibold">
                                {(row.closing - row.opening > 0 ? (row.closing - row.opening).toFixed(4) : '0.0000')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Tank dip chart inputs */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-success">Physical Tank Dips (mm)</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {data.dip_readings.map((row, i) => (
                        <Col md={4} key={row.tank_id} className="mb-3">
                          <Card className="border border-light shadow-none bg-light-subtle">
                            <Card.Body>
                              <h6 className="fw-bold text-dark">{row.tank_name} <span className="text-muted fs-12">({row.product})</span></h6>
                              <div className="mb-2 mt-3">
                                <Form.Label className="fs-12 fw-medium">Dip Level (mm)</Form.Label>
                                <Form.Control
                                  type="number"
                                  className="text-end font-monospace"
                                  value={row.dip_mm || ''}
                                  onChange={e => {
                                    const updated = [...data.dip_readings];
                                    updated[i].dip_mm = parseInt(e.target.value) || 0;
                                    setData('dip_readings', updated);
                                  }}
                                  required
                                />
                              </div>
                              <div>
                                <Form.Label className="fs-12 fw-medium">Water Dip (mm)</Form.Label>
                                <Form.Control
                                  type="number"
                                  className="text-end font-monospace"
                                  value={row.water_mm || ''}
                                  onChange={e => {
                                    const updated = [...data.dip_readings];
                                    updated[i].water_mm = parseInt(e.target.value) || 0;
                                    setData('dip_readings', updated);
                                  }}
                                />
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Cash collection */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-warning">Cash Drawer Collection</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Total Cash Collected (PKR)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={data.cash_amount || ''}
                          onChange={e => setData('cash_amount', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Shift Logs & Comments</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter shift notes, differences, machine issues..."
                          value={data.notes}
                          onChange={e => setData('notes', e.target.value)}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12} className="d-flex justify-content-between mb-5">
                <Link href={route('shifts.show', shiftLog.id)}>
                  <Button variant="light" size="lg">Cancel</Button>
                </Link>
                <Button type="submit" variant="success" size="lg" disabled={processing}>
                  {processing ? 'Processing...' : 'Close Shift & Post Journal Ledger'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

CloseShift.layout = (page: any) => <Layout children={page} />;
export default CloseShift;
