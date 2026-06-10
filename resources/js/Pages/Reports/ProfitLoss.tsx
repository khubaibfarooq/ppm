import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface PLAccount {
  code: string;
  name: string;
  balance: number;
}

interface Props {
  from: string;
  to: string;
  revenue: PLAccount[];
  expenses: PLAccount[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

const ProfitLoss = ({ from, to, revenue, expenses, totalRevenue, totalExpenses, netProfit }: Props) => {
  return (
    <React.Fragment>
      <Head title="Profit & Loss Statement | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Profit & Loss" pageTitle="Accounting Reports" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold text-dark">Income Statement (Profit & Loss)</h5>
                <span className="text-muted fs-12">Statement Period: {from} to {to}</span>
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
                  <h5 className="text-center text-muted mb-4">Profit & Loss Statement</h5>
                  
                  <Table borderless className="align-middle mb-0">
                    <tbody>
                      {/* Revenues */}
                      <tr className="border-bottom border-dark fw-bold">
                        <td colSpan={2} className="fs-15 text-primary">Operating Revenues</td>
                        <td className="text-end"></td>
                      </tr>
                      {revenue.map((r, i) => (
                        <tr key={i} className="fs-13">
                          <td style={{ paddingLeft: '1.5rem' }}>{r.name} ({r.code})</td>
                          <td className="text-end font-monospace">{r.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td></td>
                        </tr>
                      ))}
                      <tr className="fw-semibold bg-light-subtle">
                        <td style={{ paddingLeft: '1.5rem' }}>Total Revenue</td>
                        <td></td>
                        <td className="text-end font-monospace border-bottom text-primary fw-bold">
                          PKR {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr><td colSpan={3} style={{ height: '20px' }}></td></tr>

                      {/* Expenses */}
                      <tr className="border-bottom border-dark fw-bold">
                        <td colSpan={2} className="fs-15 text-danger">Operating Expenses (COGS & Overheads)</td>
                        <td className="text-end"></td>
                      </tr>
                      {expenses.map((e, i) => (
                        <tr key={i} className="fs-13">
                          <td style={{ paddingLeft: '1.5rem' }}>{e.name} ({e.code})</td>
                          <td className="text-end font-monospace">{e.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td></td>
                        </tr>
                      ))}
                      <tr className="fw-semibold bg-light-subtle">
                        <td style={{ paddingLeft: '1.5rem' }}>Total Operating Expenses</td>
                        <td></td>
                        <td className="text-end font-monospace border-bottom text-danger fw-bold">
                          PKR {totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr><td colSpan={3} style={{ height: '30px' }}></td></tr>

                      {/* Net Income */}
                      <tr className={`fs-16 fw-bold ${netProfit >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        <td className="p-3">NET INCOME / PROFIT</td>
                        <td></td>
                        <td className="text-end p-3 font-monospace border-bottom border-double border-2">
                          PKR {netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

ProfitLoss.layout = (page: any) => <Layout children={page} />;
export default ProfitLoss;
