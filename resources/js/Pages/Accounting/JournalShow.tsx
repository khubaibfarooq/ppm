import React from 'react';
import { Card, Col, Container, Row, Table, Button, Badge } from 'react-bootstrap';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Account {
  id: number;
  code: string;
  name: string;
}

interface JournalEntry {
  id: number;
  account: Account;
  debit: number;
  credit: number;
  description: string | null;
}

interface Journal {
  id: number;
  journal_number: string;
  type: string;
  date: string;
  narration: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  is_reversed: boolean;
  reversed_by: number | null;
  createdBy?: { name: string } | null;
  postedBy?: { name: string } | null;
  reversedByJournal?: { id: number; journal_number: string } | null;
  entries: JournalEntry[];
}

interface Props {
  journal: Journal;
}

const JournalShow = ({ journal }: Props) => {
  const { post, processing } = useForm();

  const handleReverse = () => {
    if (confirm('Are you sure you want to reverse this transaction?')) {
      post(route('journals.reverse', journal.id));
    }
  };

  return (
    <React.Fragment>
      <Head title={`Journal Voucher - ${journal.journal_number} | Station Manager`} />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={`Voucher: ${journal.journal_number}`} pageTitle="Journal Vouchers" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <Link href={route('journals.index')}>
                <Button variant="light">
                  <i className="ri-arrow-left-line align-middle me-1"></i> Back to Journal List
                </Button>
              </Link>
              {!journal.is_reversed && journal.is_posted && (
                <Button
                  variant="danger"
                  onClick={handleReverse}
                  disabled={processing}
                >
                  <i className="ri-repeat-line align-bottom me-1"></i> Reverse Voucher
                </Button>
              )}
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Voucher Summary</h5>
                </Card.Header>
                <Card.Body>
                  <Table borderless className="align-middle mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-muted">JV Number:</td>
                        <td className="fw-bold text-primary">{journal.journal_number}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Date:</td>
                        <td>{journal.date}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Type:</td>
                        <td className="text-uppercase">
                          <span className="badge bg-light text-dark">{journal.type}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Status:</td>
                        <td>
                          {journal.is_reversed ? (
                            <span className="badge bg-danger-subtle text-danger">REVERSED</span>
                          ) : journal.is_posted ? (
                            <span className="badge bg-success-subtle text-success">POSTED</span>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning">DRAFT</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Total Amount:</td>
                        <td className="fw-bold font-monospace">
                          PKR {journal.total_debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Prepared By:</td>
                        <td>{journal.createdBy?.name || 'System'}</td>
                      </tr>
                      {journal.postedBy && (
                        <tr>
                          <td className="fw-semibold text-muted">Posted By:</td>
                          <td>{journal.postedBy.name}</td>
                        </tr>
                      )}
                      {journal.is_reversed && journal.reversedByJournal && (
                        <tr>
                          <td className="fw-semibold text-muted">Reversal JV:</td>
                          <td>
                            <Link href={route('journals.show', journal.reversedByJournal.id)} className="fw-bold text-danger">
                              {journal.reversedByJournal.journal_number}
                            </Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">General Ledger Narration</h5>
                </Card.Header>
                <Card.Body>
                  <p className="fs-15 text-dark mb-0 bg-light p-3 rounded">
                    {journal.narration || <em>No narration provided.</em>}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Journal Line Entries</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '30%' }}>Account Code & Name</th>
                          <th>Description</th>
                          <th className="text-end" style={{ width: '20%' }}>Debit</th>
                          <th className="text-end" style={{ width: '20%' }}>Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journal.entries.map((entry) => (
                          <tr key={entry.id}>
                            <td>
                              <div className="fw-bold text-secondary">{entry.account.code}</div>
                              <div className="fs-12 text-muted">{entry.account.name}</div>
                            </td>
                            <td>{entry.description || '-'}</td>
                            <td className="text-end font-monospace text-success">
                              {entry.debit > 0 ? `PKR ${entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="text-end font-monospace text-success">
                              {entry.credit > 0 ? `PKR ${entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light fw-bold font-monospace">
                        <tr>
                          <td colSpan={2} className="text-end">Summary Totals:</td>
                          <td className="text-end text-success">
                            PKR {journal.total_debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-end text-success">
                            PKR {journal.total_credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

JournalShow.layout = (page: any) => <Layout children={page} />;
export default JournalShow;
