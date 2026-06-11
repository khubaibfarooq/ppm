import React from 'react';
import { Card, Col, Container, Row, Table, Button, Alert } from 'react-bootstrap';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Props {
  shiftLog: any;
  reconciliation: any[];
}

const Show = ({ shiftLog, reconciliation }: Props) => {
  const { post, processing } = useForm();

  const handleVerify = () => {
    post(route('shift-logs.verify', shiftLog.id));
  };

  return (
    <React.Fragment>
      <Head title={`Shift Details | ${shiftLog.shift.name}`} />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Shift Details" pageTitle="Shifts" />

          {/* Quick status alerts */}
          {shiftLog.status === 'open' && (
            <Alert variant="warning" className="d-flex align-items-center justify-content-between p-3 border-0 shadow-sm mb-4">
              <div>
                <i className="ri-error-warning-line fs-18 align-middle me-2"></i>
                This shift is currently <strong>OPEN</strong>. Operations are active.
              </div>
              <Link href={route('shift-logs.close.form', shiftLog.id)}>
                <Button variant="warning" size="sm">
                  <i className="ri-close-circle-line align-bottom me-1"></i> Reconcile & Close Shift
                </Button>
              </Link>
            </Alert>
          )}

          {shiftLog.status === 'closed' && (
            <Alert variant="success" className="d-flex align-items-center justify-content-between p-3 border-0 shadow-sm mb-4">
              <div>
                <i className="ri-checkbox-circle-line fs-18 align-middle me-2"></i>
                This shift is <strong>CLOSED</strong>. Financial journals have been automatically posted.
              </div>
              <Button variant="success" size="sm" onClick={handleVerify} disabled={processing}>
                <i className="ri-checkbox-line align-bottom me-1"></i> Verify Shift Log
              </Button>
            </Alert>
          )}

          {shiftLog.status === 'verified' && (
            <Alert variant="info" className="p-3 border-0 shadow-sm mb-4">
              <i className="ri-checkbox-double-line fs-18 align-middle me-2"></i>
              This shift log has been audited and <strong>VERIFIED</strong>.
            </Alert>
          )}

          <Row>
            {/* Metadata Card */}
            <Col lg={4} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Shift Information</h5>
                </Card.Header>
                <Card.Body>
                  <Table borderless className="mb-0 align-middle">
                    <tbody>
                      <tr>
                        <td className="text-muted fw-semibold">Shift:</td>
                        <td className="text-dark fw-bold">{shiftLog.shift.name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted fw-semibold">Date:</td>
                        <td>{shiftLog.date}</td>
                      </tr>
                      <tr>
                        <td className="text-muted fw-semibold">Opened:</td>
                        <td>{shiftLog.opened_by.name} at {new Date(shiftLog.opened_at).toLocaleTimeString()}</td>
                      </tr>
                      <tr>
                        <td className="text-muted fw-semibold">Closed:</td>
                        <td>{shiftLog.closed_by ? `${shiftLog.closed_by.name} at ${new Date(shiftLog.closed_at).toLocaleTimeString()}` : '-'}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <hr />

                  <h6 className="fw-semibold text-muted mt-3 mb-2">Shift financial summary</h6>
                  <Table borderless className="mb-0 align-middle">
                    <tbody>
                      <tr>
                        <td className="text-muted">Total Sales:</td>
                        <td className="text-end fw-bold font-monospace">PKR {shiftLog.total_revenue.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Cash Collected:</td>
                        <td className="text-end fw-bold font-monospace">PKR {shiftLog.total_cash.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Short / Excess:</td>
                        <td className={`text-end fw-bold font-monospace ${shiftLog.short_excess < 0 ? 'text-danger' : shiftLog.short_excess > 0 ? 'text-success' : 'text-muted'}`}>
                          {shiftLog.short_excess < 0 ? '-' : ''}PKR {Math.abs(shiftLog.short_excess).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            {/* Reconciliation Card */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Fuel Stock Reconciliation & Variance</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover align="middle" className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Fuel Product</th>
                          <th>Tank</th>
                          <th className="text-end">Opening Stock</th>
                          <th className="text-end">Deliveries</th>
                          <th className="text-end">Closing Stock</th>
                          <th className="text-end">Physical Sales</th>
                          <th className="text-end">Meter Sales</th>
                          <th className="text-end">Variance (L)</th>
                          <th className="text-end">Var %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliation.map((r, i) => (
                          <tr key={i}>
                            <td className="fw-semibold">{r.product_name}</td>
                            <td>{r.tank_name}</td>
                            <td className="text-end font-monospace">{r.opening_liters.toLocaleString()} L</td>
                            <td className="text-end font-monospace">{r.deliveries.toLocaleString()} L</td>
                            <td className="text-end font-monospace">{r.closing_liters.toLocaleString()} L</td>
                            <td className="text-end font-monospace text-primary fw-medium">{r.physical_sales.toLocaleString()} L</td>
                            <td className="text-end font-monospace text-info fw-medium">{r.meter_sales.toLocaleString()} L</td>
                            <td className={`text-end font-monospace fw-bold ${r.variance < 0 ? 'text-danger' : r.variance > 0 ? 'text-success' : 'text-muted'}`}>
                              {r.variance.toFixed(2)} L
                            </td>
                            <td className={`text-end font-monospace fw-medium ${Math.abs(r.variance_percentage) > 0.5 ? 'text-warning' : 'text-muted'}`}>
                              {r.variance_percentage}%
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

          <Row>
            {/* Sales Table */}
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Nozzle Sales Details</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Nozzle Label</th>
                          <th>Machine</th>
                          <th>Product</th>
                          <th className="text-end">Opening Meter</th>
                          <th className="text-end">Closing Meter</th>
                          <th className="text-end">Liters Sold</th>
                          <th className="text-end">Price</th>
                          <th className="text-end">Gross Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shiftLog.sales.length > 0 ? (
                          shiftLog.sales.map((sale: any) => (
                            <tr key={sale.id}>
                              <td className="fw-semibold">{sale.nozzle.label}</td>
                              <td>{sale.nozzle.machine.name}</td>
                              <td>{sale.nozzle.product.name}</td>
                              <td className="text-end text-muted font-monospace">{sale.opening_reading.toLocaleString()}</td>
                              <td className="text-end text-muted font-monospace">{sale.closing_reading.toLocaleString()}</td>
                              <td className="text-end font-monospace text-primary fw-medium">{sale.liters_sold.toLocaleString()} L</td>
                              <td className="text-end font-monospace">PKR {sale.sale_price}</td>
                              <td className="text-end font-monospace text-dark fw-bold">PKR {sale.gross_amount.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">No sales records logged yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {shiftLog.journal && (
            <Row>
              {/* Journal Voucher Card */}
              <Col lg={12} className="mb-5">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold text-primary">Automatically Posted Journal Voucher ({shiftLog.journal.journal_number})</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table bordered hover className="align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>GL Account</th>
                            <th>Description</th>
                            <th className="text-end" style={{ width: '180px' }}>Debit (PKR)</th>
                            <th className="text-end" style={{ width: '180px' }}>Credit (PKR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shiftLog.journal.entries.map((entry: any) => (
                            <tr key={entry.id}>
                              <td className="fw-semibold">{entry.account.code} - {entry.account.name}</td>
                              <td>{entry.description}</td>
                              <td className="text-end font-monospace text-success">{entry.debit > 0 ? entry.debit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                              <td className="text-end font-monospace text-success">{entry.credit > 0 ? entry.credit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light fw-bold font-monospace">
                          <tr>
                            <td colSpan={2} className="text-end">Total:</td>
                            <td className="text-end text-primary">PKR {shiftLog.journal.total_debit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="text-end text-primary">PKR {shiftLog.journal.total_credit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

Show.layout = (page: any) => <Layout children={page} />;
export default Show;
