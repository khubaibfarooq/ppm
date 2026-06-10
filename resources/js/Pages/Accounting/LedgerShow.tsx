import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface LedgerEntry {
  id: number;
  journal_number: string;
  journal_id: number;
  date: string;
  narration: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface Props {
  account: any;
  from: string;
  to: string;
  openingBalance: number;
  ledgerEntries: LedgerEntry[];
  closingBalance: number;
}

const LedgerShow = ({ account, from, to, openingBalance, ledgerEntries, closingBalance }: Props) => {
  const totalDebits = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <React.Fragment>
      <Head title={`Account Ledger | ${account.name}`} />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Account Ledger" pageTitle="Accounting" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold text-dark">{account.code} - {account.name}</h5>
                <span className="text-muted fs-12">Statement Period: {from} to {to} | Normal Balance: {account.normal_balance.toUpperCase()}</span>
              </div>
              <Link href={route('ledger.index')}>
                <Button variant="light">
                  <i className="ri-arrow-left-line align-middle me-1"></i> Back to search
                </Button>
              </Link>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover align="middle" className="mb-0 table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>JV Number</th>
                          <th>Narration</th>
                          <th>Line Description</th>
                          <th className="text-end" style={{ width: '150px' }}>Debit (PKR)</th>
                          <th className="text-end" style={{ width: '150px' }}>Credit (PKR)</th>
                          <th className="text-end" style={{ width: '180px' }}>Running Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Opening Balance Row */}
                        <tr className="table-light-subtle fw-semibold">
                          <td>{from}</td>
                          <td>-</td>
                          <td colSpan={2}>OPENING BALANCE</td>
                          <td className="text-end">-</td>
                          <td className="text-end">-</td>
                          <td className="text-end font-monospace">
                            PKR {openingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>

                        {/* Entries */}
                        {ledgerEntries.map((e, index) => (
                          <tr key={index}>
                            <td>{e.date}</td>
                            <td className="fw-semibold">
                              <Link href={route('journals.show', e.journal_id)}>
                                {e.journal_number}
                              </Link>
                            </td>
                            <td>{e.narration}</td>
                            <td className="text-muted">{e.description || '-'}</td>
                            <td className="text-end font-monospace text-success">
                              {e.debit > 0 ? e.debit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                            </td>
                            <td className="text-end font-monospace text-success">
                              {e.credit > 0 ? e.credit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                            </td>
                            <td className="text-end font-monospace text-primary fw-medium">
                              PKR {e.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                          </tr>
                        ))}

                        {/* Summary Totals */}
                        <tr className="table-light-subtle fw-bold">
                          <td colSpan={4} className="text-end">Statement Totals & Closing Balance:</td>
                          <td className="text-end font-monospace">
                            PKR {totalDebits.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="text-end font-monospace">
                            PKR {totalCredits.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="text-end font-monospace text-primary bg-primary-subtle">
                            PKR {closingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>
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

LedgerShow.layout = (page: any) => <Layout children={page} />;
export default LedgerShow;
