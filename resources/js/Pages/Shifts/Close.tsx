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
  opening_dip: number;
}

interface Supplier {
  id: number;
  name: string;
  company_name: string;
}

interface Props {
  shiftLog: any;
  nozzles: Nozzle[];
  tanks: Tank[];
  suppliers: Supplier[];
}

const CloseShift = ({ shiftLog, nozzles, tanks, suppliers }: Props) => {
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
      opening_dip: t.opening_dip || 0,
      dip_mm: 0,
      water_mm: 0,
    })),
    supplies: [] as Array<{
      tank_id: string | number;
      supplier_id: string | number;
      liters_received: number;
      cost_per_liter: number;
    }>,
    cash_amount: 0,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('shift-logs.close', shiftLog.id));
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
                    <h5 className="card-title mb-0 fw-bold text-primary">Nozzle Readings</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table bordered hover className="align-middle table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Nozzle</th>
                            <th>Product</th>
                            <th style={{ width: '180px' }} className="text-end">Opening Meter</th>
                            <th style={{ width: '180px' }} className="text-end">Closing Meter</th>
                            <th className="text-end" style={{ width: '150px' }}>Liters Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.meter_readings.map((row, i) => (
                            <tr key={row.nozzle_id}>
                              <td>{row.nozzle_label}</td>
                              <td>{row.product_name}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.0001"
                                  className="text-end font-monospace"
                                  value={row.opening}
                                  onChange={e => {
                                    const updated = [...data.meter_readings];
                                    updated[i].opening = parseFloat(e.target.value) || 0;
                                    setData('meter_readings', updated);
                                  }}
                                  required
                                />
                              </td>
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
                                <Form.Label className="fs-12 fw-medium">Opening Dip Level (mm)</Form.Label>
                                <Form.Control
                                  type="number"
                                  className="text-end font-monospace"
                                  value={row.opening_dip}
                                  onChange={e => {
                                    const updated = [...data.dip_readings];
                                    updated[i].opening_dip = parseInt(e.target.value) || 0;
                                    setData('dip_readings', updated);
                                  }}
                                  required
                                />
                              </div>

                              <div className="mb-2">
                                <Form.Label className="fs-12 fw-medium">Closing Dip Level (mm)</Form.Label>
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

              {/* Supplies section */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0 fw-bold text-danger">Supplies (Purchasing during shift)</h5>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => {
                        setData('supplies', [
                          ...data.supplies, 
                          { tank_id: '', supplier_id: '', liters_received: 0, cost_per_liter: 0 }
                        ]);
                      }}
                    >
                      <i className="ri-add-line align-middle me-1"></i> Add Supply
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {data.supplies.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="ri-shopping-cart-2-line fs-24 mb-2 d-block text-muted"></i>
                        No supplies recorded for this shift yet. Click "Add Supply" to record a delivery.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table bordered hover className="align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Tank</th>
                              <th>Supplier</th>
                              <th style={{ width: '180px' }} className="text-end">Liters Received</th>
                              <th style={{ width: '180px' }} className="text-end">Cost per Liter (PKR)</th>
                              <th style={{ width: '180px' }} className="text-end">Total Cost (PKR)</th>
                              <th style={{ width: '80px' }} className="text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.supplies.map((row, i) => (
                              <tr key={i}>
                                <td>
                                  <Form.Select
                                    value={row.tank_id}
                                    onChange={e => {
                                      const updated = [...data.supplies];
                                      updated[i].tank_id = e.target.value;
                                      setData('supplies', updated);
                                    }}
                                    required
                                  >
                                    <option value="">-- Select Tank --</option>
                                    {tanks.map(t => (
                                      <option key={t.id} value={t.id}>
                                        {t.name} ({t.product.name})
                                      </option>
                                    ))}
                                  </Form.Select>
                                </td>
                                <td>
                                  <Form.Select
                                    value={row.supplier_id}
                                    onChange={e => {
                                      const updated = [...data.supplies];
                                      updated[i].supplier_id = e.target.value;
                                      setData('supplies', updated);
                                    }}
                                    required
                                  >
                                    <option value="">-- Select Supplier --</option>
                                    {suppliers.map(s => (
                                      <option key={s.id} value={s.id}>
                                        {s.name} ({s.company_name})
                                      </option>
                                    ))}
                                  </Form.Select>
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    step="0.0001"
                                    className="text-end font-monospace"
                                    value={row.liters_received || ''}
                                    onChange={e => {
                                      const updated = [...data.supplies];
                                      updated[i].liters_received = parseFloat(e.target.value) || 0;
                                      setData('supplies', updated);
                                    }}
                                    required
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    className="text-end font-monospace"
                                    value={row.cost_per_liter || ''}
                                    onChange={e => {
                                      const updated = [...data.supplies];
                                      updated[i].cost_per_liter = parseFloat(e.target.value) || 0;
                                      setData('supplies', updated);
                                    }}
                                    required
                                    min="0"
                                  />
                                </td>
                                <td className="text-end font-monospace fw-semibold text-danger">
                                  {((row.liters_received || 0) * (row.cost_per_liter || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="text-center">
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm" 
                                    onClick={() => {
                                      const updated = data.supplies.filter((_, idx) => idx !== i);
                                      setData('supplies', updated);
                                    }}
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
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
                <Link href={route('shift-logs.show', shiftLog.id)}>
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
