import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Vehicle {
  id: number;
  customer_id: number;
  vehicle_number: string;
  balance: number;
  is_active: boolean;
}

interface Customer {
  id: number;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  is_active: boolean;
  vehicles?: Vehicle[];
}

interface Props {
  customers: Customer[];
}

const Index = ({ customers }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [vehicleProcessing, setVehicleProcessing] = useState(false);

  const addForm = useForm({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const payForm = useForm({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
    vehicle_id: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('customers.store'), {
      onSuccess: () => {
        addForm.reset();
        setShowAddModal(false);
      }
    });
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    payForm.post(route('customers.payment', selectedCust.id), {
      onSuccess: () => {
        payForm.reset();
        setShowPayModal(false);
      }
    });
  };

  const openPaymentModal = (cust: Customer) => {
    setSelectedCust(cust);
    payForm.setData({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: '',
      vehicle_id: '',
    });
    setShowPayModal(true);
  };

  const openVehiclesModal = (cust: Customer) => {
    setSelectedCust(cust);
    setShowVehiclesModal(true);
    setNewVehicleNumber('');
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !newVehicleNumber.trim()) return;
    setVehicleProcessing(true);
    router.post(route('customers.vehicles.store', selectedCust.id), {
      vehicle_number: newVehicleNumber
    }, {
      onSuccess: (page) => {
        setNewVehicleNumber('');
        setVehicleProcessing(false);
        const updatedCust = (page.props.customers as Customer[]).find(c => c.id === selectedCust.id);
        if (updatedCust) setSelectedCust(updatedCust);
      },
      onError: () => {
        setVehicleProcessing(false);
      }
    });
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    setVehicleProcessing(true);
    router.delete(route('vehicles.destroy', vehicleId), {
      onSuccess: (page) => {
        setVehicleProcessing(false);
        if (selectedCust) {
          const updatedCust = (page.props.customers as Customer[]).find(c => c.id === selectedCust.id);
          if (updatedCust) setSelectedCust(updatedCust);
        }
      },
      onError: () => {
        setVehicleProcessing(false);
      }
    });
  };

  return (
    <React.Fragment>
      <Head title="Credit Customers | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Customers (Accounts Receivable)" pageTitle="Commercial Accounts" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Manage credit customers registry and receivable accounts balances</h5>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="ri-add-line align-bottom me-1"></i> Register Customer
              </Button>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Customer Name</th>
                          <th>Company</th>
                          <th>Contact Info</th>
                          <th>Address</th>
                          <th className="text-end" style={{ width: '180px' }}>Receivable Balance</th>
                          <th>Status</th>
                          <th className="text-center" style={{ width: '180px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(cust => (
                          <tr key={cust.id}>
                            <td className="fw-semibold text-primary">{cust.name}</td>
                            <td>{cust.company_name || '-'}</td>
                            <td>
                              <div className="fs-12 text-muted">
                                {cust.email && <div><i className="ri-mail-line align-middle me-1"></i> {cust.email}</div>}
                                {cust.phone && <div><i className="ri-phone-line align-middle me-1"></i> {cust.phone}</div>}
                              </div>
                            </td>
                            <td>{cust.address || '-'}</td>
                            <td className="text-end font-monospace fw-bold text-danger">
                              PKR {cust.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <span className={`badge ${cust.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                {cust.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <Button variant="soft-success" size="sm" onClick={() => openPaymentModal(cust)}>
                                  <i className="ri-hand-coin-line align-bottom"></i> Pay
                                </Button>
                                <Button variant="soft-primary" size="sm" onClick={() => openVehiclesModal(cust)}>
                                  <i className="ri-car-line align-bottom"></i> Vehicles ({cust.vehicles?.length || 0})
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Add Customer Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Register Customer</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Bilal Ahmed"
                    value={addForm.data.name}
                    onChange={e => addForm.setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Bilal Logistics"
                    value={addForm.data.company_name}
                    onChange={e => addForm.setData('company_name', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="e.g. bilal@bilallogistics.com"
                    value={addForm.data.email}
                    onChange={e => addForm.setData('email', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 0321-1234567"
                    value={addForm.data.phone}
                    onChange={e => addForm.setData('phone', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Billing Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Office/Factory location details..."
                    value={addForm.data.address}
                    onChange={e => addForm.setData('address', e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={addForm.processing}>Save Customer</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Receive Payment Modal */}
          <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Receive Payment - {selectedCust?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handlePaySubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={payForm.data.payment_date}
                    onChange={e => payForm.setData('payment_date', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Amount Received (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={payForm.data.amount}
                    onChange={e => payForm.setData('amount', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Apply to Vehicle Balance (Optional)</Form.Label>
                  <Form.Select
                    value={payForm.data.vehicle_id}
                    onChange={e => payForm.setData('vehicle_id', e.target.value)}
                  >
                    <option value="">-- General Account (Auto-Distribute) --</option>
                    {selectedCust?.vehicles?.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_number} (Outstanding: PKR {v.balance.toLocaleString(undefined, {minimumFractionDigits: 2})})
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={payForm.data.payment_method}
                    onChange={e => payForm.setData('payment_method', e.target.value as any)}
                    required
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Deposit</option>
                  </Form.Select>
                </div>
                <div className="mb-3">
                  <Form.Label>Transaction Memo / Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Cheque/Slip reference number"
                    value={payForm.data.notes}
                    onChange={e => payForm.setData('notes', e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowPayModal(false)}>Cancel</Button>
                <Button type="submit" variant="success" disabled={payForm.processing}>Post Collection Entry</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Manage Vehicles Modal */}
          <Modal show={showVehiclesModal} onHide={() => setShowVehiclesModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Manage Vehicles - {selectedCust?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-4">
                <Form onSubmit={handleAddVehicle} className="row g-3 align-items-end">
                  <div className="col-sm-8">
                    <Form.Label className="fw-semibold">Register New Vehicle</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. LED-4921 or Motor-12"
                      value={newVehicleNumber}
                      onChange={e => setNewVehicleNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-4">
                    <Button type="submit" variant="primary" className="w-100" disabled={vehicleProcessing}>
                      <i className="ri-add-line me-1"></i> Register Vehicle
                    </Button>
                  </div>
                </Form>
              </div>

              <h6 className="fw-bold mb-3 text-muted">Registered Vehicles Registry</h6>
              <div className="table-responsive">
                <Table bordered hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Vehicle Number</th>
                      <th className="text-end" style={{ width: '200px' }}>Outstanding Balance</th>
                      <th className="text-center" style={{ width: '120px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCust?.vehicles && selectedCust.vehicles.length > 0 ? (
                      selectedCust.vehicles.map(v => (
                        <tr key={v.id}>
                          <td className="fw-semibold">{v.vehicle_number}</td>
                          <td className="text-end font-monospace fw-bold text-danger">
                            PKR {v.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-center">
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleDeleteVehicle(v.id)}
                              disabled={v.balance > 0 || vehicleProcessing}
                              title={v.balance > 0 ? 'Cannot remove vehicle with outstanding balance' : 'Remove vehicle'}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">No vehicles registered for this customer.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={() => setShowVehiclesModal(false)}>Close</Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
