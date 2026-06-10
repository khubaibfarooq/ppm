import React, { useState } from 'react';
import { Card, Col, Container, Row, Button, Modal, Form, Table } from 'react-bootstrap';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Tank {
  id: number;
  name: string;
  product_id: number;
  product: { name: string };
  capacity_liters: number;
  current_liters: number;
  low_level_alert: number;
  fill_percentage: number;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
}

interface Props {
  tanks: Tank[];
  products: Product[];
}

const Index = ({ tanks, products }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  // Add Tank Form
  const addForm = useForm({
    name: '',
    product_id: products.length > 0 ? products[0].id : '',
    capacity_liters: '',
    current_liters: '',
    low_level_alert: '',
  });

  // Delivery Form
  const deliveryForm = useForm({
    tank_id: '',
    supplier_id: 1, // seeded supplier
    delivery_date: new Date().toISOString().split('T')[0],
    liters_received: '',
    cost_per_liter: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('tanks.store'), {
      onSuccess: () => {
        addForm.reset();
        setShowAddModal(false);
      }
    });
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deliveryForm.post(route('tanks.deliveries.store', deliveryForm.data.tank_id), {
      onSuccess: () => {
        deliveryForm.reset();
        setShowDeliveryModal(false);
      }
    });
  };

  const openDelivery = (tank: Tank) => {
    setSelectedTank(tank);
    deliveryForm.setData('tank_id', tank.id.toString());
    setShowDeliveryModal(true);
  };

  return (
    <React.Fragment>
      <Head title="Fuel Tanks | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Fuel Tanks" pageTitle="Inventory" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Manage storage tanks and stock deliveries</h5>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="ri-add-line align-bottom me-1"></i> Add Storage Tank
              </Button>
            </Col>
          </Row>

          <Row>
            {tanks.map((tank) => (
              <Col lg={4} key={tank.id} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Header className="bg-transparent border-0 pt-3 d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0 fw-bold">{tank.name}</h5>
                    <span className={`badge ${tank.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {tank.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center py-3">
                      <div className="display-4 text-primary font-monospace mb-2">
                        {tank.current_liters.toLocaleString()} L
                      </div>
                      <span className="text-muted">Current Volume / Capacity: {tank.capacity_liters.toLocaleString()} L</span>
                    </div>

                    <div className="mt-4">
                      <div className="d-flex justify-content-between mb-1 fs-12 fw-medium text-muted">
                        <span>Fill Level ({tank.fill_percentage}%)</span>
                        {tank.current_liters <= tank.low_level_alert && (
                          <span className="text-danger fw-bold"><i className="ri-error-warning-fill align-middle me-1"></i>LOW LEVEL ALERT</span>
                        )}
                      </div>
                      <div className="progress progress-lg" style={{ height: '15px' }}>
                        <div
                          className={`progress-bar ${tank.fill_percentage < 20 ? 'bg-danger' : tank.fill_percentage < 50 ? 'bg-warning' : 'bg-primary'}`}
                          role="progressbar"
                          style={{ width: `${tank.fill_percentage}%` }}
                          aria-valuenow={tank.fill_percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-top d-flex justify-content-between">
                      <Link href={route('tanks.dip-chart', tank.id)}>
                        <Button variant="soft-info" size="sm">
                          <i className="ri-line-chart-line align-bottom me-1"></i> Calibration Chart
                        </Button>
                      </Link>
                      <Button variant="soft-success" size="sm" onClick={() => openDelivery(tank)}>
                        <i className="ri-truck-line align-bottom me-1"></i> Receive Delivery
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Add Tank Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Add Storage Tank</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Tank Name / Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Tank PMG-1"
                    value={addForm.data.name}
                    onChange={e => addForm.setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Product Type</Form.Label>
                  <Form.Select
                    value={addForm.data.product_id}
                    onChange={e => addForm.setData('product_id', e.target.value)}
                    required
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </div>
                <div className="mb-3">
                  <Form.Label>Capacity (Liters)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="25000"
                    value={addForm.data.capacity_liters}
                    onChange={e => addForm.setData('capacity_liters', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Current Volume (Liters)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="15000"
                    value={addForm.data.current_liters}
                    onChange={e => addForm.setData('current_liters', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Low Level Alert (Liters)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="5000"
                    value={addForm.data.low_level_alert}
                    onChange={e => addForm.setData('low_level_alert', e.target.value)}
                    required
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={addForm.processing}>Save Tank</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Receive Delivery Modal */}
          <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Receive Fuel Delivery - {selectedTank?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleDeliverySubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Delivery Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={deliveryForm.data.delivery_date}
                    onChange={e => deliveryForm.setData('delivery_date', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Liters Received</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="10000"
                    value={deliveryForm.data.liters_received}
                    onChange={e => deliveryForm.setData('liters_received', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Purchase Cost per Liter (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={deliveryForm.data.cost_per_liter}
                    onChange={e => deliveryForm.setData('cost_per_liter', e.target.value)}
                    required
                  />
                </div>
                {deliveryForm.data.liters_received && deliveryForm.data.cost_per_liter && (
                  <div className="alert alert-info-subtle border-0 mb-0 mt-3 p-3">
                    <span className="fw-semibold">Total Payable Amount:</span>{' '}
                    <span className="font-monospace fw-bold text-primary">
                      PKR {(parseFloat(deliveryForm.data.liters_received) * parseFloat(deliveryForm.data.cost_per_liter)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowDeliveryModal(false)}>Close</Button>
                <Button type="submit" variant="success" disabled={deliveryForm.processing}>Post Fuel Delivery</Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
