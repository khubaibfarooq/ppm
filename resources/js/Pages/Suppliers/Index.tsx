import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Supplier {
  id: number;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  balance: number;
  is_active: boolean;
}

interface Props {
  suppliers: Supplier[];
}

const Index = ({ suppliers }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const addForm = useForm({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const editForm = useForm({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
  });

  const payForm = useForm({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('suppliers.store'), {
      onSuccess: () => {
        addForm.reset();
        setShowAddModal(false);
      },
    });
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    editForm.setData({
      name: supplier.name,
      company_name: supplier.company_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      is_active: supplier.is_active,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    editForm.put(route('suppliers.update', selectedSupplier.id), {
      onSuccess: () => {
        editForm.reset();
        setShowEditModal(false);
        setSelectedSupplier(null);
      },
    });
  };

  const handlePayClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    payForm.setData({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: '',
    });
    setShowPayModal(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    payForm.post(route('suppliers.payment', selectedSupplier.id), {
      onSuccess: () => {
        payForm.reset();
        setShowPayModal(false);
        setSelectedSupplier(null);
      },
    });
  };

  const totalPayable = suppliers.reduce((sum, s) => sum + Number(s.balance), 0);
  const activeCount = suppliers.filter(s => s.is_active).length;

  return (
    <React.Fragment>
      <Head title="Suppliers & Accounts Payable | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Suppliers (AP)" pageTitle="Commercial" />

          {/* Quick Stats Panel */}
          <Row className="mb-4">
            <Col md={6} lg={4}>
              <Card className="card-animate border-0 shadow-sm bg-danger text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-white-50 text-uppercase mb-2">Total Accounts Payable</p>
                      <h2 className="mb-0 fw-bold">PKR {totalPayable.toLocaleString()}</h2>
                    </div>
                    <div className="avatar-sm">
                      <span className="avatar-title bg-white-subtle rounded-circle fs-3 text-white">
                        <i className="ri-money-dollar-circle-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="card-animate border-0 shadow-sm bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-white-50 text-uppercase mb-2">Active Suppliers</p>
                      <h2 className="mb-0 fw-bold">{activeCount} / {suppliers.length}</h2>
                    </div>
                    <div className="avatar-sm">
                      <span className="avatar-title bg-white-subtle rounded-circle fs-3 text-white">
                        <i className="ri-truck-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Header Action Row */}
          <Row className="mb-4 align-items-center">
            <Col>
              <h5 className="mb-0 text-muted">Manage supplier credentials, view outstanding AP balances, and log vendor disbursements</h5>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="ri-add-line align-bottom me-1"></i> Add Supplier
              </Button>
            </Col>
          </Row>

          {/* Main Grid */}
          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0">
                      <thead className="table-light text-muted">
                        <tr>
                          <th>Supplier Name</th>
                          <th>Company</th>
                          <th>Contact Details</th>
                          <th>Full Address</th>
                          <th className="text-end">Balance Payable</th>
                          <th>Status</th>
                          <th className="text-center" style={{ width: '180px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center text-muted py-4">
                              No suppliers found. Click "Add Supplier" to register one.
                            </td>
                          </tr>
                        ) : (
                          suppliers.map((supplier) => (
                            <tr key={supplier.id}>
                              <td>
                                <div className="fw-semibold text-primary">{supplier.name}</div>
                              </td>
                              <td>{supplier.company_name || <span className="text-muted fs-12">N/A</span>}</td>
                              <td>
                                <div className="fs-12 text-muted">
                                  {supplier.email && <div><i className="ri-mail-line align-middle me-1"></i> {supplier.email}</div>}
                                  {supplier.phone && <div><i className="ri-phone-line align-middle me-1"></i> {supplier.phone}</div>}
                                  {!supplier.email && !supplier.phone && <span>-</span>}
                                </div>
                              </td>
                              <td className="text-truncate" style={{ maxWidth: '200px' }} title={supplier.address || ''}>
                                {supplier.address || <span className="text-muted fs-12">N/A</span>}
                              </td>
                              <td className="text-end font-monospace fw-bold text-danger">
                                PKR {Number(supplier.balance).toLocaleString()}
                              </td>
                              <td>
                                <Badge bg={supplier.is_active ? 'success-subtle' : 'danger-subtle'} className={`text-uppercase ${supplier.is_active ? 'text-success' : 'text-danger'}`}>
                                  {supplier.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handlePayClick(supplier)}
                                  disabled={Number(supplier.balance) <= 0}
                                  title="Post a payment voucher"
                                >
                                  <i className="ri-hand-coin-line align-middle me-1"></i> Pay
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleEditClick(supplier)}
                                >
                                  <i className="ri-pencil-line align-middle"></i>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Add Supplier Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Add Supplier</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Supplier Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. PSO Fuel Distributor"
                    value={addForm.data.name}
                    onChange={e => addForm.setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Pakistan State Oil Ltd"
                    value={addForm.data.company_name}
                    onChange={e => addForm.setData('company_name', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="e.g. billing@pso.com.pk"
                    value={addForm.data.email}
                    onChange={e => addForm.setData('email', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. +92 21 111-111-776"
                    value={addForm.data.phone}
                    onChange={e => addForm.setData('phone', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Business Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Physical address..."
                    value={addForm.data.address}
                    onChange={e => addForm.setData('address', e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={addForm.processing}>Add Supplier</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Edit Supplier Modal */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Edit Supplier Details</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Supplier Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.data.name}
                    onChange={e => editForm.setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.data.company_name}
                    onChange={e => editForm.setData('company_name', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={editForm.data.email}
                    onChange={e => editForm.setData('email', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.data.phone}
                    onChange={e => editForm.setData('phone', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Business Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editForm.data.address}
                    onChange={e => editForm.setData('address', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Check
                    type="switch"
                    id="supplier-status-switch"
                    label="Supplier is Active"
                    checked={editForm.data.is_active}
                    onChange={e => editForm.setData('is_active', e.target.checked)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={editForm.processing}>Save Changes</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Pay Supplier Modal */}
          <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-success">
                <i className="ri-hand-coin-line align-middle me-1"></i> Make Supplier Payment
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handlePaySubmit}>
              <Modal.Body>
                {selectedSupplier && (
                  <div className="alert alert-secondary border-0 mb-4 py-2 px-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Supplier Name:</span>
                      <strong className="text-dark">{selectedSupplier.name}</strong>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted">Outstanding AP Balance:</span>
                      <strong className="text-danger">PKR {Number(selectedSupplier.balance).toLocaleString()}</strong>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <Form.Label>Payment Amount (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedSupplier ? selectedSupplier.balance : undefined}
                    placeholder="Enter payment amount"
                    value={payForm.data.amount}
                    onChange={e => payForm.setData('amount', e.target.value)}
                    required
                  />
                </div>
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
                  <Form.Label>Disbursement Mode</Form.Label>
                  <Form.Select
                    value={payForm.data.payment_method}
                    onChange={e => payForm.setData('payment_method', e.target.value)}
                    required
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Account Transfer</option>
                  </Form.Select>
                </div>
                <div className="mb-3">
                  <Form.Label>Internal Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Reference / Check number / Bank slip number..."
                    value={payForm.data.notes}
                    onChange={e => payForm.setData('notes', e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowPayModal(false)}>Cancel</Button>
                <Button type="submit" variant="success" disabled={payForm.processing}>Post Payment Voucher</Button>
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
