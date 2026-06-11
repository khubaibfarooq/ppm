import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Card, Col, Container, Row, Form, Button, Table } from 'react-bootstrap';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Shift {
  id: number;
  name: string;
}

interface Nozzle {
  id: number;
  label: string;
  machine_name: string;
  product_name: string;
  last_reading: number;
}

interface Tank {
  id: number;
  name: string;
  product_name: string;
  last_dip: number;
}

interface Props {
  shifts: Shift[];
  nozzles: Nozzle[];
  tanks: Tank[];
}

const Create = ({ shifts, nozzles, tanks }: Props) => {
  const { data, setData, post, processing, errors } = useForm({
    shift_id: shifts.length > 0 ? shifts[0].id : '',
    date: new Date().toISOString().split('T')[0],
    meter_readings: nozzles.map(n => ({
      nozzle_id: n.id,
      label: `${n.machine_name} - ${n.label} (${n.product_name})`,
      reading_value: n.last_reading,
    })),
    dip_readings: tanks.map(t => ({
      tank_id: t.id,
      name: `${t.name} (${t.product_name})`,
      dip_mm: t.last_dip,
      water_dip_mm: 0,
    })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('shift-logs.open'));
  };

  return (
    <React.Fragment>
      <Head title="Open Shift | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Open Shift" pageTitle="Shifts" />

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Shift info card */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-dark">Shift Details</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Select Shift Template</Form.Label>
                        <Form.Select
                          value={data.shift_id}
                          onChange={e => setData('shift_id', e.target.value)}
                          required
                          isInvalid={!!errors.shift_id}
                        >
                          <option value="">-- Choose Shift --</option>
                          {shifts.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.shift_id}</Form.Control.Feedback>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={data.date}
                          onChange={e => setData('date', e.target.value)}
                          required
                          isInvalid={!!errors.date}
                        />
                        <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Nozzle opening values */}
              <Col lg={6} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-primary">Nozzle Opening Readings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive bordered hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Nozzle Details</th>
                          <th style={{ width: '180px' }} className="text-end">Opening Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.meter_readings.map((mr, index) => (
                          <tr key={mr.nozzle_id}>
                            <td>{mr.label}</td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.0001"
                                className="text-end font-monospace"
                                value={mr.reading_value}
                                onChange={e => {
                                  const updated = [...data.meter_readings];
                                  updated[index].reading_value = parseFloat(e.target.value) || 0;
                                  setData('meter_readings', updated);
                                }}
                                required
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              {/* Tank opening dips */}
              <Col lg={6} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-success">Tank Physical Opening Dips (mm)</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive bordered hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tank Details</th>
                          <th style={{ width: '130px' }} className="text-end">Dip Level (mm)</th>
                          <th style={{ width: '130px' }} className="text-end">Water Dip (mm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.dip_readings.map((dr, index) => (
                          <tr key={dr.tank_id}>
                            <td>{dr.name}</td>
                            <td>
                              <Form.Control
                                type="number"
                                className="text-end font-monospace"
                                value={dr.dip_mm}
                                onChange={e => {
                                  const updated = [...data.dip_readings];
                                  updated[index].dip_mm = parseInt(e.target.value) || 0;
                                  setData('dip_readings', updated);
                                }}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                className="text-end font-monospace"
                                value={dr.water_dip_mm}
                                onChange={e => {
                                  const updated = [...data.dip_readings];
                                  updated[index].water_dip_mm = parseInt(e.target.value) || 0;
                                  setData('dip_readings', updated);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12} className="d-flex justify-content-between mb-5">
                <Link href={route('shift-logs.index')}>
                  <Button variant="light" size="lg">Cancel</Button>
                </Link>
                <Button type="submit" variant="primary" size="lg" disabled={processing}>
                  {processing ? 'Opening...' : 'Start Station Shift'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

Create.layout = (page: any) => <Layout children={page} />;
export default Create;
