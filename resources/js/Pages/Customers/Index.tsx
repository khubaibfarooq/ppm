import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Customer {
  id: number;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  is_active: boolean;
}

interface Props {
  customers: Customer[];
}

const Index = ({ customers }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

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
    setShowPayModal(true);
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
                    <Table bordered hover align="middle" className="mb-0">
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
                              <Button variant="soft-success" size="sm" onClick={() => openPaymentModal(cust)}>
                                <i className="ri-hand-coin-line align-bottom me-1"></i> Receive Payment
                              </Button>
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
        </Container>
      </div>
    </React.Fragment>
  );
};

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
