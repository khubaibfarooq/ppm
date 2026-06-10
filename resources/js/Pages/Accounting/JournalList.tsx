import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

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
  createdBy: { name: string };
}

interface Props {
  journals: { data: Journal[] };
}

const JournalList = ({ journals }: Props) => {
  const { post, processing } = useForm();

  const handleReverse = (id: number) => {
    if (confirm('Are you sure you want to reverse this transaction?')) {
      post(route('journals.reverse', id));
    }
  };

  return (
    <React.Fragment>
      <Head title="Journal Vouchers | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Journal Vouchers" pageTitle="Accounting" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">All General Ledger transaction vouchers list</h5>
              <Link href={route('journals.create')}>
                <Button variant="primary">
                  <i className="ri-add-line align-bottom me-1"></i> New Journal Entry
                </Button>
              </Link>
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
                          <th>JV Number</th>
                          <th>Date</th>
                          <th>Narration</th>
                          <th>Type</th>
                          <th className="text-end">Total Amount</th>
                          <th>Status</th>
                          <th>Prepared By</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journals.data.map((jv) => (
                          <tr key={jv.id}>
                            <td className="fw-bold text-primary">{jv.journal_number}</td>
                            <td>{jv.date}</td>
                            <td>{jv.narration}</td>
                            <td>
                              <span className="badge bg-light text-dark text-uppercase">{jv.type}</span>
                            </td>
                            <td className="text-end font-monospace">PKR {jv.total_debit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td>
                              {jv.is_reversed ? (
                                <span className="badge bg-danger-subtle text-danger">REVERSED</span>
                              ) : jv.is_posted ? (
                                <span className="badge bg-success-subtle text-success">POSTED</span>
                              ) : (
                                <span className="badge bg-warning-subtle text-warning">DRAFT</span>
                              )}
                            </td>
                            <td>{jv.createdBy.name}</td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <Link href={route('journals.show', jv.id)}>
                                  <Button variant="soft-primary" size="sm">
                                    <i className="ri-eye-line align-bottom"></i>
                                  </Button>
                                </Link>
                                {!jv.is_reversed && jv.is_posted && (
                                  <Button variant="soft-danger" size="sm" onClick={() => handleReverse(jv.id)} disabled={processing}>
                                    <i className="ri-repeat-line align-bottom"></i> Reverse
                                  </Button>
                                )}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

JournalList.layout = (page: any) => <Layout children={page} />;
export default JournalList;
