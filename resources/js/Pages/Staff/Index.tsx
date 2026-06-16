import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm, usePage } from '@inertiajs/react';
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
  station?: { id: number; name: string } | null;
}

interface Props {
  staff: User[];
  roles: string[];
  stations?: { id: number; name: string }[];
}

const Index = ({ staff, roles, stations = [] }: Props) => {
  const { props } = usePage();
  const authUser: any = props.auth?.user;
  const isSuperAdmin = authUser?.roles?.some((role: any) => role.name === 'super_admin');

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
    station_id: '',
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
              <div>
                <h5 className="mb-0 text-dark">Manage Staff Directory</h5>
                <p className="text-muted mb-0 fs-13">Manage employee records and access authorization levels</p>
              </div>
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
                          {isSuperAdmin && <th>Station</th>}
                          <th>Designation</th>
                          <th>Contact Details</th>
                          <th>CNIC</th>
                          <th className="text-end">Basic Salary</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.length > 0 ? (
                          staff.map((user) => (
                            <tr key={user.id}>
                              <td className="fw-bold font-monospace text-dark">{user.employee_code}</td>
                              <td className="fw-semibold text-primary">{user.name}</td>
                              {isSuperAdmin && <td className="fw-medium text-dark">{user.station?.name || 'Global Admin'}</td>}
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isSuperAdmin ? 9 : 8} className="text-center py-4 text-muted">
                              No employees found.
                            </td>
                          </tr>
                        )}
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
                      isInvalid={!!form.errors.name}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.name}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="e.g. david@station.com"
                      value={form.data.email}
                      onChange={e => form.setData('email', e.target.value)}
                      isInvalid={!!form.errors.email}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.email}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Min 8 characters"
                      value={form.data.password}
                      onChange={e => form.setData('password', e.target.value)}
                      isInvalid={!!form.errors.password}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.password}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Employee Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. EMP-007"
                      value={form.data.employee_code}
                      onChange={e => form.setData('employee_code', e.target.value)}
                      isInvalid={!!form.errors.employee_code}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.employee_code}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 0300-1234567"
                      value={form.data.phone}
                      onChange={e => form.setData('phone', e.target.value)}
                      isInvalid={!!form.errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.phone}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>CNIC Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 37405-1234567-1"
                      value={form.data.cnic}
                      onChange={e => form.setData('cnic', e.target.value)}
                      isInvalid={!!form.errors.cnic}
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.cnic}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Designation</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Shift Attendant"
                      value={form.data.designation}
                      onChange={e => form.setData('designation', e.target.value)}
                      isInvalid={!!form.errors.designation}
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.designation}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Basic Salary (PKR)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="25000"
                      value={form.data.basic_salary}
                      onChange={e => form.setData('basic_salary', e.target.value)}
                      isInvalid={!!form.errors.basic_salary}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.basic_salary}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Join Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.data.join_date}
                      onChange={e => form.setData('join_date', e.target.value)}
                      isInvalid={!!form.errors.join_date}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.join_date}</Form.Control.Feedback>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Access Role</Form.Label>
                    <Form.Select
                      value={form.data.role}
                      onChange={e => form.setData('role', e.target.value)}
                      isInvalid={!!form.errors.role}
                      required
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{form.errors.role}</Form.Control.Feedback>
                  </Col>
                  
                  {isSuperAdmin && (
                    <Col md={12} className="mb-3">
                      <Form.Label>Station Assignment</Form.Label>
                      <Form.Select
                        value={form.data.station_id}
                        onChange={e => form.setData('station_id', e.target.value)}
                        isInvalid={!!form.errors.station_id}
                        required
                      >
                        <option value="">-- Select Station --</option>
                        {stations.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{form.errors.station_id}</Form.Control.Feedback>
                    </Col>
                  )}

                  <Col lg={12} className="mb-3">
                    <Form.Label>Residential Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Full home address..."
                      value={form.data.address}
                      onChange={e => form.setData('address', e.target.value)}
                      isInvalid={!!form.errors.address}
                    />
                    <Form.Control.Feedback type="invalid">{form.errors.address}</Form.Control.Feedback>
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
