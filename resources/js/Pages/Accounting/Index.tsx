import React, { useState } from 'react';
import { Card, Col, Container, Row, Tab, Nav, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Account {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  sub_type: string;
  normal_balance: 'debit' | 'credit';
  parent_id: number | null;
  is_control: boolean;
  is_system: boolean;
  is_active: boolean;
  balance?: { debit_total: number; credit_total: number; balance: number };
}

interface Props {
  accounts: Account[];
}

const Index = ({ accounts }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const addForm = useForm({
    code: '',
    name: '',
    type: 'asset',
    sub_type: '',
    parent_id: '',
    is_control: false,
    normal_balance: 'debit',
    description: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('accounts.store'), {
      onSuccess: () => {
        addForm.reset();
        setShowAddModal(false);
      }
    });
  };

  const renderAccountTable = (type: string) => {
    const filtered = accounts.filter(acc => acc.type === type);
    return (
      <div className="table-responsive mt-3">
        <Table bordered hover align="middle" className="mb-0 table-nowrap">
          <thead className="table-light">
            <tr>
              <th style={{ width: '120px' }}>Code</th>
              <th>Account Name</th>
              <th>Normal Balance</th>
              <th>Classification</th>
              <th className="text-end" style={{ width: '180px' }}>Current Balance</th>
              <th>System Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id} style={{ fontWeight: acc.is_control ? 'bold' : 'normal' }}>
                <td className="font-monospace text-primary">{acc.code}</td>
                <td style={{ paddingLeft: acc.parent_id ? '2.5rem' : '0.75rem' }}>
                  {acc.parent_id && <i className="ri-corner-down-right-line text-muted me-2 align-middle"></i>}
                  {acc.name}
                  {acc.is_control && <span className="badge bg-info-subtle text-info ms-2">Control</span>}
                </td>
                <td className="text-uppercase fs-12 text-muted">{acc.normal_balance}</td>
                <td>{acc.sub_type || '-'}</td>
                <td className="text-end font-monospace">
                  PKR {acc.balance ? acc.balance.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                </td>
                <td>
                  {acc.is_system ? (
                    <span className="badge bg-lock-fill text-muted"><i className="ri-lock-line align-middle me-1"></i> System Locking</span>
                  ) : (
                    <span className="text-muted fs-12">User defined</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <React.Fragment>
      <Head title="Chart of Accounts | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Chart of Accounts" pageTitle="Accounting" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Manage general ledger accounts structures</h5>
              <div className="d-flex gap-2">
                <Link href={route('journals.create')} className="btn btn-soft-primary">
                  <i className="ri-add-line align-bottom me-1"></i> New Journal Entry
                </Link>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <i className="ri-add-line align-bottom me-1"></i> Create GL Account
                </Button>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Tab.Container defaultActiveKey="asset">
                    <Nav variant="pills" className="nav-justified bg-light rounded p-1 mb-4">
                      <Nav.Item>
                        <Nav.Link eventKey="asset" className="text-uppercase fw-bold">Assets</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="liability" className="text-uppercase fw-bold">Liabilities</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="equity" className="text-uppercase fw-bold">Equity</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="revenue" className="text-uppercase fw-bold">Revenues</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="expense" className="text-uppercase fw-bold">Expenses</Nav.Link>
                      </Nav.Item>
                    </Nav>

                    <Tab.Content>
                      <Tab.Pane eventKey="asset">{renderAccountTable('asset')}</Tab.Pane>
                      <Tab.Pane eventKey="liability">{renderAccountTable('liability')}</Tab.Pane>
                      <Tab.Pane eventKey="equity">{renderAccountTable('equity')}</Tab.Pane>
                      <Tab.Pane eventKey="revenue">{renderAccountTable('revenue')}</Tab.Pane>
                      <Tab.Pane eventKey="expense">{renderAccountTable('expense')}</Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Add Account Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Create GL Account</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Account Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 1110"
                      value={addForm.data.code}
                      onChange={e => addForm.setData('code', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Account Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Cash Drawer 2"
                      value={addForm.data.name}
                      onChange={e => addForm.setData('name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Account Type</Form.Label>
                    <Form.Select
                      value={addForm.data.type}
                      onChange={e => {
                        const val = e.target.value as any;
                        addForm.setData(data => ({
                          ...data,
                          type: val,
                          normal_balance: (val === 'asset' || val === 'expense') ? 'debit' : 'credit'
                        }));
                      }}
                      required
                    >
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Normal Balance</Form.Label>
                    <Form.Select
                      value={addForm.data.normal_balance}
                      onChange={e => addForm.setData('normal_balance', e.target.value as any)}
                      required
                    >
                      <option value="debit">DEBIT</option>
                      <option value="credit">CREDIT</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Parent Account (Optional)</Form.Label>
                    <Form.Select
                      value={addForm.data.parent_id}
                      onChange={e => addForm.setData('parent_id', e.target.value)}
                    >
                      <option value="">-- Choose Control Account --</option>
                      {accounts.filter(a => a.is_control).map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3 d-flex align-items-end">
                    <Form.Check
                      type="checkbox"
                      id="is_control"
                      label="Mark as Control Account (Summation header)"
                      checked={addForm.data.is_control}
                      onChange={e => addForm.setData('is_control', e.target.checked)}
                      className="mb-2"
                    />
                  </Col>
                  <Col lg={12} className="mb-3">
                    <Form.Label>Account Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Account purpose..."
                      value={addForm.data.description}
                      onChange={e => addForm.setData('description', e.target.value)}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={addForm.processing}>Save Account</Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

import { Link } from '@inertiajs/react';

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
