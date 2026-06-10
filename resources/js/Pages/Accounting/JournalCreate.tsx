import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Card, Col, Container, Row, Form, Button, Table } from 'react-bootstrap';
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

const JournalCreate = ({ accounts }: Props) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    date: new Date().toISOString().split('T')[0],
    narration: '',
    entries: [
      { account_id: 0, debit: 0, credit: 0, description: '' },
      { account_id: 0, debit: 0, credit: 0, description: '' },
    ]
  });

  const totalDebit = data.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = data.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleEntryChange = (index: number, field: string, value: any) => {
    const updated = [...data.entries];
    updated[index] = {
      ...updated[index],
      [field]: value
    };

    // Auto-wipe opposite side on value entries
    if (field === 'debit' && value > 0) {
      updated[index].credit = 0;
    }
    if (field === 'credit' && value > 0) {
      updated[index].debit = 0;
    }

    setData('entries', updated);
  };

  const addRow = () => {
    setData('entries', [...data.entries, { account_id: 0, debit: 0, credit: 0, description: '' }]);
  };

  const removeRow = (index: number) => {
    if (data.entries.length > 2) {
      setData('entries', data.entries.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    post(route('journals.store'), {
      onSuccess: () => reset()
    });
  };

  return (
    <React.Fragment>
      <Head title="Create Journal Entry | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="New Journal Entry" pageTitle="Accounting" />

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Row>
                      <Col md={4} className="mb-3">
                        <Form.Label className="fw-semibold">JV Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={data.date}
                          onChange={e => setData('date', e.target.value)}
                          required
                        />
                      </Col>
                      <Col md={8} className="mb-3">
                        <Form.Label className="fw-semibold">Narration / Description</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="General journal description"
                          value={data.narration}
                          onChange={e => setData('narration', e.target.value)}
                          required
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3 d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0 fw-bold">Journal Line Details</h5>
                    <Button variant="soft-primary" size="sm" onClick={addRow}>
                      <i className="ri-add-line align-bottom me-1"></i> Add Line
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table bordered hover className="align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '30%' }}>Account</th>
                            <th>Description</th>
                            <th className="text-end" style={{ width: '15%' }}>Debit</th>
                            <th className="text-end" style={{ width: '15%' }}>Credit</th>
                            <th className="text-center" style={{ width: '80px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.entries.map((row, i) => (
                            <tr key={i}>
                              <td>
                                <Form.Select
                                  value={row.account_id || ''}
                                  onChange={e => handleEntryChange(i, 'account_id', parseInt(e.target.value))}
                                  required
                                >
                                  <option value="">Select Account</option>
                                  {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                      {acc.code} - {acc.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  placeholder="Line item notes..."
                                  value={row.description}
                                  onChange={e => handleEntryChange(i, 'description', e.target.value)}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  className="text-end font-monospace"
                                  placeholder="0.00"
                                  value={row.debit || ''}
                                  onChange={e => handleEntryChange(i, 'debit', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  className="text-end font-monospace"
                                  placeholder="0.00"
                                  value={row.credit || ''}
                                  onChange={e => handleEntryChange(i, 'credit', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => removeRow(i)}
                                  disabled={data.entries.length <= 2}
                                >
                                  <i className="ri-delete-bin-line fs-15"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light fw-bold font-monospace">
                          <tr>
                            <td colSpan={2} className="text-end">Summary Totals:</td>
                            <td className="text-end text-success">PKR {totalDebit.toFixed(2)}</td>
                            <td className="text-end text-success">PKR {totalCredit.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>

                    {!isBalanced && (
                      <div className="alert alert-danger-subtle border-danger mt-3 mb-0" role="alert">
                        <i className="ri-error-warning-line align-middle me-2"></i>
                        The Journal Entry lines are unbalanced by <strong>PKR {Math.abs(totalDebit - totalCredit).toFixed(2)}</strong>.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={12} className="d-flex justify-content-between mb-5">
                <Link href={route('journals.index')}>
                  <Button variant="light" size="lg">Cancel</Button>
                </Link>
                <Button type="submit" variant="primary" size="lg" disabled={!isBalanced || processing}>
                  {processing ? 'Posting JV...' : 'Post Journal Entry'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

JournalCreate.layout = (page: any) => <Layout children={page} />;
export default JournalCreate;
