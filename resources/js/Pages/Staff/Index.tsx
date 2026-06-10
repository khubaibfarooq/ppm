import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface User {
  id: number;
  name: string;
  email: string;
  employee_code: string;
  phone: string;
  cnic: string;
  designation: string;
  basic_salary: number;
  join_date: string;
  status: 'active' | 'inactive' | 'terminated';
  roles: { id: number; name: string }[];
}

interface Props {
  staff: User[];
  roles: string[];
}

const Index = ({ staff, roles }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const form = useForm({
    name: '',
    email: '',
    password: '',
    employee_code: '',
    phone: '',
    cnic: '',
    address: '',
    designation: '',
    basic_salary: '',
    join_date: new Date().toISOString().split('T')[0],
    role: roles.length > 0 ? roles[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('staff.store'), {
      onSuccess: () => {
        form.reset();
        setShowAddModal(false);
      }
    });
  };

  return (
    <React.Fragment>
      <Head title="Staff Directory | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Staff Directory" pageTitle="HR" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Manage employee records and access authorization levels</h5>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="ri-add-line align-bottom me-1"></i> Add Employee
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
                          <th>Code</th>
                          <th>Full Name</th>
                          <th>Designation</th>
                          <th>Contact Details</th>
                          <th>CNIC</th>
                          <th className="text-end">Basic Salary</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((user) => (
                          <tr key={user.id}>
                            <td className="fw-bold font-monospace text-dark">{user.employee_code}</td>
                            <td className="fw-semibold text-primary">{user.name}</td>
                            <td>{user.designation || '-'}</td>
                            <td>
                              <div className="fs-12 text-muted">
                                <div><i className="ri-mail-line align-middle me-1"></i> {user.email}</div>
                                {user.phone && <div><i className="ri-phone-line align-middle me-1"></i> {user.phone}</div>}
                              </div>
                            </td>
                            <td className="font-monospace fs-12">{user.cnic || '-'}</td>
                            <td className="text-end font-monospace">PKR {user.basic_salary.toLocaleString()}</td>
                            <td>
                              {user.roles.map(r => (
                                <span key={r.id} className="badge bg-primary-subtle text-primary text-uppercase me-1">
                                  {r.name.replace('_', ' ')}
                                </span>
                              ))}
                            </td>
                            <td>
                              <span className={`badge ${
                                user.status === 'active' 
                                  ? 'bg-success-subtle text-success' 
                                  : user.status === 'inactive' 
                                    ? 'bg-warning-subtle text-warning' 
                                    : 'bg-danger-subtle text-danger'
                              } text-uppercase`}>
                                {user.status}
                              </span>
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

          {/* Add Staff Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Add New Employee</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. David Tenant"
                      value={form.data.name}
                      onChange={e => form.setData('name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="e.g. david@station.com"
                      value={form.data.email}
                      onChange={e => form.setData('email', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Min 8 characters"
                      value={form.data.password}
                      onChange={e => form.setData('password', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Employee Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. EMP-007"
                      value={form.data.employee_code}
                      onChange={e => form.setData('employee_code', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 0300-1234567"
                      value={form.data.phone}
                      onChange={e => form.setData('phone', e.target.value)}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>CNIC Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 37405-1234567-1"
                      value={form.data.cnic}
                      onChange={e => form.setData('cnic', e.target.value)}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Designation</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Shift Attendant"
                      value={form.data.designation}
                      onChange={e => form.setData('designation', e.target.value)}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Basic Salary (PKR)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="25000"
                      value={form.data.basic_salary}
                      onChange={e => form.setData('basic_salary', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Join Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.data.join_date}
                      onChange={e => form.setData('join_date', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Access Role</Form.Label>
                    <Form.Select
                      value={form.data.role}
                      onChange={e => form.setData('role', e.target.value)}
                      required
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={12} className="mb-3">
                    <Form.Label>Residential Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Full home address..."
                      value={form.data.address}
                      onChange={e => form.setData('address', e.target.value)}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={form.processing}>Save Employee</Button>
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
