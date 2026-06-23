import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Card, Col, Container, Row, Form, Button, Table } from 'react-bootstrap';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Nozzle {
  id: number;
  label: string;
  machine: { name: string };
  product: { id: number; name: string; current_price: number };
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

interface Customer {
  id: number;
  name: string;
  company_name: string;
  vehicles: Array<{
    id: number;
    vehicle_number: string;
    balance: number;
  }>;
}

interface Product {
  id: number;
  name: string;
  current_price: number;
}

interface Props {
  shiftLog: any;
  nozzles: Nozzle[];
  tanks: Tank[];
  suppliers: Supplier[];
  customers: Customer[];
  products: Product[];
}

const CloseShift = ({ shiftLog, nozzles, tanks, suppliers, customers, products }: Props) => {
  const { data, setData, post, processing, errors } = useForm({
    meter_readings: nozzles.map(n => ({
      nozzle_id: n.id,
      nozzle_label: `${n.machine.name} - ${n.label}`,
      product_name: n.product.name,
      price: n.product.current_price,
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
    credit_sales: [] as Array<{
      customer_id: string | number;
      vehicle_id: string | number;
      product_id: string | number;
      liters_sold: number;
      sale_price: number;
      total_amount: number;
      vehicle_number: string;
      slip_number: string;
    }>,
    cash_amount: 0,
    notes: '',
  });

  const handleCreditSaleChange = (index: number, field: string, value: any) => {
    const updated = [...data.credit_sales];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill price when product changes
    if (field === 'product_id') {
      const prod = products.find(p => p.id === Number(value));
      if (prod) {
        updated[index].sale_price = prod.current_price;
        updated[index].total_amount = Number((updated[index].liters_sold * prod.current_price).toFixed(2));
      }
    }

    // Auto-fill vehicle number string from registry when vehicle_id changes
    if (field === 'vehicle_id') {
      const cust = customers.find(c => c.id === Number(updated[index].customer_id));
      const veh = cust?.vehicles.find(v => v.id === Number(value));
      if (veh) {
        updated[index].vehicle_number = veh.vehicle_number;
      } else {
        updated[index].vehicle_number = '';
      }
    }

    // Reset vehicle registry selection if customer changes
    if (field === 'customer_id') {
      updated[index].vehicle_id = '';
      updated[index].vehicle_number = '';
    }

    // Recalculate total amount when liters_sold or sale_price changes
    if (field === 'liters_sold' || field === 'sale_price') {
      const liters = Number(updated[index].liters_sold) || 0;
      const price = Number(updated[index].sale_price) || 0;
      updated[index].total_amount = Number((liters * price).toFixed(2));
    }

    setData('credit_sales', updated);
  };

  const totalRevenue = data.meter_readings.reduce((sum, row) => {
    const liters = Math.max(0, row.closing - row.opening);
    return sum + (liters * row.price);
  }, 0);

  const totalCredit = data.credit_sales.reduce((sum, cs) => {
    return sum + (Number(cs.total_amount) || 0);
  }, 0);

  const expectedCash = Math.max(0, totalRevenue - totalCredit);
  const variance = data.cash_amount - expectedCash;

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

              {/* Credit Sales Section */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0 fw-bold text-info">Credit Sales (Commercial Accounts)</h5>
                    <Button 
                      variant="outline-info" 
                      size="sm" 
                      onClick={() => {
                        setData('credit_sales', [
                          ...data.credit_sales, 
                          { customer_id: '', vehicle_id: '', product_id: '', liters_sold: 0, sale_price: 0, total_amount: 0, vehicle_number: '', slip_number: '' }
                        ]);
                      }}
                    >
                      <i className="ri-add-line align-middle me-1"></i> Add Credit Sale
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {data.credit_sales.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="ri-bank-card-2-line fs-24 mb-2 d-block text-muted"></i>
                        No credit sales recorded for this shift yet. Click "Add Credit Sale" to record a commercial sale.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table bordered hover className="align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Customer</th>
                              <th>Vehicle</th>
                              <th>Product</th>
                              <th style={{ width: '130px' }} className="text-end">Liters Sold</th>
                              <th style={{ width: '130px' }} className="text-end">Price (PKR)</th>
                              <th style={{ width: '150px' }} className="text-end">Total Credit (PKR)</th>
                              <th>Vehicle Ref</th>
                              <th>Slip No.</th>
                              <th style={{ width: '60px' }} className="text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.credit_sales.map((row, i) => {
                              const selectedCustomer = customers.find(c => c.id === Number(row.customer_id));
                              const vehiclesList = selectedCustomer ? selectedCustomer.vehicles : [];

                              return (
                                <tr key={i}>
                                  <td>
                                    <Form.Select
                                      value={row.customer_id}
                                      onChange={e => handleCreditSaleChange(i, 'customer_id', e.target.value)}
                                      required
                                    >
                                      <option value="">-- Customer --</option>
                                      {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                          {c.name} {c.company_name ? `(${c.company_name})` : ''}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </td>
                                  <td>
                                    <Form.Select
                                      value={row.vehicle_id}
                                      onChange={e => handleCreditSaleChange(i, 'vehicle_id', e.target.value)}
                                      disabled={!row.customer_id}
                                    >
                                      <option value="">-- General Account --</option>
                                      {vehiclesList.map(v => (
                                        <option key={v.id} value={v.id}>
                                          {v.vehicle_number}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </td>
                                  <td>
                                    <Form.Select
                                      value={row.product_id}
                                      onChange={e => handleCreditSaleChange(i, 'product_id', e.target.value)}
                                      required
                                    >
                                      <option value="">-- Product --</option>
                                      {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                          {p.name}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      step="0.0001"
                                      className="text-end font-monospace"
                                      value={row.liters_sold || ''}
                                      onChange={e => handleCreditSaleChange(i, 'liters_sold', parseFloat(e.target.value) || 0)}
                                      required
                                      min="0.0001"
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      className="text-end font-monospace"
                                      value={row.sale_price || ''}
                                      onChange={e => handleCreditSaleChange(i, 'sale_price', parseFloat(e.target.value) || 0)}
                                      required
                                      min="0"
                                    />
                                  </td>
                                  <td className="text-end font-monospace fw-semibold text-info">
                                    {row.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      placeholder="Plate / Desc"
                                      value={row.vehicle_number || ''}
                                      onChange={e => handleCreditSaleChange(i, 'vehicle_number', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      placeholder="Slip #"
                                      value={row.slip_number || ''}
                                      onChange={e => handleCreditSaleChange(i, 'slip_number', e.target.value)}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm" 
                                      onClick={() => {
                                        const updated = data.credit_sales.filter((_, idx) => idx !== i);
                                        setData('credit_sales', updated);
                                      }}
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
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

              {/* Interactive Balance Summary */}
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0 bg-light-subtle border border-light">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-dark">Shift Account Balancing Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="text-center">
                      <Col md={3} className="border-end border-light">
                        <div className="p-2">
                          <h6 className="text-muted mb-1 fs-12 uppercase fw-semibold">Total Revenue (Meters)</h6>
                          <h4 className="fw-bold font-monospace text-primary">PKR {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                        </div>
                      </Col>
                      <Col md={3} className="border-end border-light">
                        <div className="p-2">
                          <h6 className="text-muted mb-1 fs-12 uppercase fw-semibold">Total Credit Sales</h6>
                          <h4 className="fw-bold font-monospace text-danger">PKR {totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                        </div>
                      </Col>
                      <Col md={3} className="border-end border-light">
                        <div className="p-2">
                          <h6 className="text-muted mb-1 fs-12 uppercase fw-semibold">Expected Cash Drawer</h6>
                          <h4 className="fw-bold font-monospace text-success">PKR {expectedCash.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="p-2">
                          <h6 className="text-muted mb-1 fs-12 uppercase fw-semibold">Drawer Variance (Short/Excess)</h6>
                          <h4 className={`fw-bold font-monospace ${variance < 0 ? 'text-danger' : variance > 0 ? 'text-success' : 'text-muted'}`}>
                            {variance > 0 ? '+' : ''}PKR {variance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </h4>
                          <span className="fs-11 text-muted d-block mt-1">
                            {variance === 0 ? 'Drawer balances perfectly!' : variance < 0 ? 'Cash shortage in drawer' : 'Cash excess in drawer'}
                          </span>
                        </div>
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
