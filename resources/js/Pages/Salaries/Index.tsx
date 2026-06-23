import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface User {
  id: number;
  name: string;
  employee_code: string;
  designation: string;
  basic_salary: number;
}

interface Payment {
  id: number;
  user: { name: string; employee_code: string };
  payment_date: string;
  basic_salary: number;
  bonus: number;
  deductions: number;
  net_amount: number;
  payment_method: string;
}

interface Props {
  employees: User[];
  payments: { data: Payment[] };
}

const Index = ({ employees, payments }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<User | null>(null);

  const form = useForm({
    user_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    bonus: '',
    deductions: '',
    payment_method: 'cash',
  });

  const handleOpenProcess = (emp: User) => {
    setSelectedEmp(emp);
    form.setData('user_id', emp.id.toString());
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('salaries.process'), {
      onSuccess: () => {
        form.reset();
        setShowModal(false);
      }
    });
  };

  const netSalaryPreview = selectedEmp
    ? selectedEmp.basic_salary + (parseFloat(form.data.bonus) || 0) - (parseFloat(form.data.deductions) || 0)
    : 0;

  return (
    <React.Fragment>
      <Head title="HR Payroll | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Salaries & Payroll" pageTitle="HR" />

          <Row className="mb-4">
            <Col>
              <h5 className="text-muted">Process basic salaries and bonus disbursements</h5>
            </Col>
          </Row>

          <Row>
            {/* Active Staff List */}
            <Col lg={5} className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold text-dark">Active Employees</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light fs-12">
                        <tr>
                          <th>Employee</th>
                          <th className="text-end">Basic Salary</th>
                          <th className="text-center" style={{ width: '120px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map(emp => (
                          <tr key={emp.id}>
                            <td>
                              <div className="fw-semibold text-primary">{emp.name}</div>
                              <span className="text-muted fs-11">{emp.employee_code} | {emp.designation}</span>
                            </td>
                            <td className="text-end font-monospace">PKR {emp.basic_salary.toLocaleString()}</td>
                            <td className="text-center">
                              <Button variant="soft-success" size="sm" onClick={() => handleOpenProcess(emp)}>
                                <i className="ri-wallet-3-line align-bottom"></i> Process
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

            {/* Payroll History */}
            <Col lg={7} className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold text-dark">Processed Payroll Ledger</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0">
                      <thead className="table-light fs-12">
                        <tr>
                          <th>Employee</th>
                          <th>Pay Date</th>
                          <th className="text-end">Basic</th>
                          <th className="text-end">Bonus</th>
                          <th className="text-end">Deductions</th>
                          <th className="text-end">Net Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.data.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div className="fw-semibold text-dark">{p.user.name}</div>
                              <span className="text-muted fs-11">{p.user.employee_code}</span>
                            </td>
                            <td>{p.payment_date}</td>
                            <td className="text-end font-monospace">PKR {p.basic_salary.toLocaleString()}</td>
                            <td className="text-end font-monospace text-success">+{p.bonus.toLocaleString()}</td>
                            <td className="text-end font-monospace text-danger">-{p.deductions.toLocaleString()}</td>
                            <td className="text-end font-monospace fw-bold text-primary">PKR {p.net_amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        {payments.data.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center text-muted py-5">No salary transactions processed yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Salary Process Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Process Salary - {selectedEmp?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Base Salary (PKR)</Form.Label>
                  <Form.Control
                    type="text"
                    value={`PKR ${selectedEmp?.basic_salary.toLocaleString()}`}
                    disabled
                    className="bg-light font-monospace fw-bold"
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Disbursement Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.data.payment_date}
                    onChange={e => form.setData('payment_date', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Bonus (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={form.data.bonus}
                    onChange={e => form.setData('bonus', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Deductions / Advances (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={form.data.deductions}
                    onChange={e => form.setData('deductions', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={form.data.payment_method}
                    onChange={e => form.setData('payment_method', e.target.value as any)}
                    required
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Transfer</option>
                  </Form.Select>
                </div>

                <div className="alert alert-success-subtle border-0 p-3 mt-3 mb-0">
                  <span className="fw-semibold">Net Payout Amount:</span>{' '}
                  <span className="font-monospace fw-bold text-success">
                    PKR {netSalaryPreview.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={form.processing}>Post Payroll Voucher</Button>
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
