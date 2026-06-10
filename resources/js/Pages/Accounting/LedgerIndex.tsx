import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Account {
  id: number;
  code: string;
  name: string;
}

interface Props {
  accounts: Account[];
}

const LedgerIndex = ({ accounts }: Props) => {
  const form = useForm({
    account_id: accounts.length > 0 ? accounts[0].id : '',
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // start of month
    to: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.data.account_id) return;
    window.location.href = route('ledger.show', form.data.account_id) + `?from=${form.data.from}&to=${form.data.to}`;
  };

  return (
    <React.Fragment>
      <Head title="General Ledger Filter | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="General Ledger" pageTitle="Accounting" />

          <Row className="justify-content-center">
            <Col lg={6}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">General Ledger Account Search</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <Form.Label className="fw-semibold">Select GL Account</Form.Label>
                      <Form.Select
                        value={form.data.account_id}
                        onChange={e => form.setData('account_id', e.target.value)}
                        required
                      >
                        <option value="">-- Choose Account --</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </Form.Select>
                    </div>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">From Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.data.from}
                          onChange={e => form.setData('from', e.target.value)}
                          required
                        />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">To Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.data.to}
                          onChange={e => form.setData('to', e.target.value)}
                          required
                        />
                      </Col>
                    </Row>

                    <div className="text-end mt-4">
                      <Button type="submit" variant="primary" className="w-100 py-2">
                        <i className="ri-search-line align-bottom me-1"></i> Generate General Ledger
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

LedgerIndex.layout = (page: any) => <Layout children={page} />;
export default LedgerIndex;
