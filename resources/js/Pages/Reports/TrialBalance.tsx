import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface TrialBalanceAccount {
  code: string;
  name: string;
  type: string;
  debit_total: number;
  credit_total: number;
  balance: number;
}

interface Props {
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
  asOf: string;
}

const TrialBalance = ({ accounts, totalDebit, totalCredit, asOf }: Props) => {
  return (
    <React.Fragment>
      <Head title="Trial Balance Report | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Trial Balance" pageTitle="Accounting Reports" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold text-dark">Trial Balance Statement</h5>
                <span className="text-muted fs-12">As of Date: {asOf}</span>
              </div>
              <Button variant="light" onClick={() => window.print()}>
                <i className="ri-printer-line align-bottom me-1"></i> Print Statement
              </Button>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0 table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '120px' }}>Code</th>
                          <th>Account Name</th>
                          <th>Classification</th>
                          <th className="text-end" style={{ width: '200px' }}>Debit Total</th>
                          <th className="text-end" style={{ width: '200px' }}>Credit Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((acc, index) => (
                          <tr key={index}>
                            <td className="font-monospace text-primary fw-semibold">{acc.code}</td>
                            <td>{acc.name}</td>
                            <td className="text-uppercase text-muted fs-12">{acc.type}</td>
                            <td className="text-end font-monospace text-success">
                              {acc.debit_total > 0 ? acc.debit_total.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                            </td>
                            <td className="text-end font-monospace text-success">
                              {acc.credit_total > 0 ? acc.credit_total.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                            </td>
                          </tr>
                        ))}

                        {/* Summary totals */}
                        <tr className="table-light-subtle fw-bold fs-15">
                          <td colSpan={3} className="text-end">Balanced Grand Totals:</td>
                          <td className="text-end font-monospace text-primary border-top border-bottom border-2">
                            PKR {totalDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="text-end font-monospace text-primary border-top border-bottom border-2">
                            PKR {totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  {Math.abs(totalDebit - totalCredit) > 0.01 && (
                    <div className="alert alert-danger-subtle border-danger mt-4 mb-0" role="alert">
                      <i className="ri-error-warning-line align-middle me-2 fs-16"></i>
                      <strong>ALERT:</strong> The general ledger is out of balance by <strong>PKR {Math.abs(totalDebit - totalCredit).toFixed(2)}</strong>. This indicates a double-entry posting error.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

TrialBalance.layout = (page: any) => <Layout children={page} />;
export default TrialBalance;
