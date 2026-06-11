import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface ShiftLog {
  id: number;
  date: string;
  shift: { name: string };
  status: 'open' | 'closed' | 'verified';
  total_liters_sold: number;
  total_revenue: number;
  total_cash: number;
  short_excess: number;
  opened_by: { name: string };
  closed_by: { name: string } | null;
}

interface Props {
  shiftLogs: { data: ShiftLog[] };
}

const Index = ({ shiftLogs }: Props) => {
  return (
    <React.Fragment>
      <Head title="Shifts Logs | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Shift Logs" pageTitle="Shifts" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Daily operations logging</h5>
              <Link href={route('shift-logs.create')}>
                <Button variant="primary" className="btn-label waves-effect waves-light">
                  <i className="ri-add-line label-icon align-middle fs-16 me-2"></i> Open New Shift
                </Button>
              </Link>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table className="align-middle table-nowrap mb-0 table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Shift</th>
                          <th>Status</th>
                          <th className="text-end">Liters Sold</th>
                          <th className="text-end">Total Revenue</th>
                          <th className="text-end">Short / Excess</th>
                          <th>Opened By</th>
                          <th>Closed By</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shiftLogs.data.length > 0 ? (
                          shiftLogs.data.map((log) => (
                            <tr key={log.id}>
                              <td className="fw-semibold text-primary">{log.date}</td>
                              <td>{log.shift.name}</td>
                              <td>
                                <span className={`badge ${
                                  log.status === 'open' 
                                    ? 'bg-warning-subtle text-warning' 
                                    : log.status === 'closed' 
                                      ? 'bg-success-subtle text-success' 
                                      : 'bg-info-subtle text-info'
                                } text-uppercase`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="text-end text-dark font-monospace">{log.total_liters_sold.toLocaleString()} L</td>
                              <td className="text-end text-dark font-monospace">PKR {log.total_revenue.toLocaleString()}</td>
                              <td className={`text-end font-monospace fw-medium ${log.short_excess < 0 ? 'text-danger' : log.short_excess > 0 ? 'text-success' : 'text-muted'}`}>
                                {log.short_excess < 0 ? '-' : ''}PKR {Math.abs(log.short_excess).toLocaleString()}
                              </td>
                              <td>{log.opened_by.name}</td>
                              <td>{log.closed_by ? log.closed_by.name : '-'}</td>
                              <td className="text-center">
                                <Link href={route('shift-logs.show', log.id)}>
                                  <Button variant="soft-primary" size="sm" className="me-2">
                                    <i className="ri-eye-line align-bottom me-1"></i> View Details
                                  </Button>
                                </Link>
                                {log.status === 'open' && (
                                  <Link href={route('shift-logs.close.form', log.id)}>
                                    <Button variant="soft-warning" size="sm">
                                      <i className="ri-close-circle-line align-bottom me-1"></i> Close Shift
                                    </Button>
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="text-center text-muted py-5">No shift logs found. Click "Open New Shift" to get started.</td>
                          </tr>
                        )}
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

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
