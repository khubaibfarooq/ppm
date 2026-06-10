import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface BSAccount {
  code: string;
  name: string;
  balance: number;
}

interface Props {
  date: string;
  assets: BSAccount[];
  liabilities: BSAccount[];
  equity: BSAccount[];
  netProfit: number; // Current period net income
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

const BalanceSheet = ({ date, assets, liabilities, equity, netProfit, totalAssets, totalLiabilities, totalEquity }: Props) => {
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <React.Fragment>
      <Head title="Balance Sheet Report | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Balance Sheet" pageTitle="Accounting Reports" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold text-dark">Statement of Financial Position (Balance Sheet)</h5>
                <span className="text-muted fs-12">As of Date: {date}</span>
              </div>
              <Button variant="light" onClick={() => window.print()}>
                <i className="ri-printer-line align-bottom me-1"></i> Print Statement
              </Button>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <h4 className="text-center fw-bold mb-1">Main Street Station</h4>
                  <h5 className="text-center text-muted mb-4">Balance Sheet Statement</h5>

                  <Table borderless className="align-middle mb-0">
                    <tbody>
                      {/* ASSETS */}
                      <tr className="border-bottom border-dark fw-bold">
                        <td colSpan={2} className="fs-15 text-primary">ASSETS</td>
                        <td></td>
                      </tr>
                      {assets.map((a, i) => (
                        <tr key={i} className="fs-13">
                          <td style={{ paddingLeft: '1.5rem' }}>{a.name} ({a.code})</td>
                          <td className="text-end font-monospace">{a.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td></td>
                        </tr>
                      ))}
                      <tr className="fw-bold bg-light-subtle fs-14">
                        <td style={{ paddingLeft: '1.5rem' }}>Total Assets</td>
                        <td></td>
                        <td className="text-end font-monospace text-primary border-bottom border-double border-2">
                          PKR {totalAssets.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr><td colSpan={3} style={{ height: '25px' }}></td></tr>

                      {/* LIABILITIES */}
                      <tr className="border-bottom border-dark fw-bold">
                        <td colSpan={2} className="fs-15 text-danger">LIABILITIES</td>
                        <td></td>
                      </tr>
                      {liabilities.map((l, i) => (
                        <tr key={i} className="fs-13">
                          <td style={{ paddingLeft: '1.5rem' }}>{l.name} ({l.code})</td>
                          <td className="text-end font-monospace">{l.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td></td>
                        </tr>
                      ))}
                      <tr className="fw-bold bg-light-subtle fs-14">
                        <td style={{ paddingLeft: '1.5rem' }}>Total Liabilities</td>
                        <td></td>
                        <td className="text-end font-monospace text-danger border-bottom">
                          PKR {totalLiabilities.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr><td colSpan={3} style={{ height: '20px' }}></td></tr>

                      {/* EQUITY */}
                      <tr className="border-bottom border-dark fw-bold">
                        <td colSpan={2} className="fs-15 text-success">EQUITY</td>
                        <td></td>
                      </tr>
                      {equity.map((e, i) => (
                        <tr key={i} className="fs-13">
                          <td style={{ paddingLeft: '1.5rem' }}>{e.name} ({e.code})</td>
                          <td className="text-end font-monospace">{e.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td></td>
                        </tr>
                      ))}
                      {/* Net income portion */}
                      <tr className="fs-13">
                        <td style={{ paddingLeft: '1.5rem' }} className="fst-italic text-muted">Retained Earnings (Current Period Profit)</td>
                        <td className="text-end font-monospace">{netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td></td>
                      </tr>
                      <tr className="fw-bold bg-light-subtle fs-14">
                        <td style={{ paddingLeft: '1.5rem' }}>Total Equity</td>
                        <td></td>
                        <td className="text-end font-monospace text-success border-bottom">
                          PKR {totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr><td colSpan={3} style={{ height: '25px' }}></td></tr>

                      {/* Liabilities & Equity sum */}
                      <tr className="fw-bold bg-dark-subtle fs-15">
                        <td className="p-3">TOTAL LIABILITIES & EQUITY</td>
                        <td></td>
                        <td className="text-end p-3 font-monospace border-bottom border-double border-2">
                          PKR {totalLiabilitiesAndEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  {Math.abs(totalAssets - totalLiabilitiesAndEquity) > 0.01 && (
                    <div className="alert alert-danger-subtle border-danger mt-4 mb-0" role="alert">
                      <i className="ri-error-warning-line align-middle me-2 fs-16"></i>
                      <strong>ALERT:</strong> The balance sheet is out of balance by <strong>PKR {Math.abs(totalAssets - totalLiabilitiesAndEquity).toFixed(2)}</strong>. Debits must equal Credits.
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

BalanceSheet.layout = (page: any) => <Layout children={page} />;
export default BalanceSheet;
