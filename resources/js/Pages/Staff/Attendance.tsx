import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Badge, Form } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface User {
  id: number;
  name: string;
  employee_code: string;
  designation: string;
  status: 'active' | 'inactive' | 'terminated';
}

interface Props {
  staff: User[];
}

const Attendance = ({ staff }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceStates, setAttendanceStates] = useState<Record<number, string>>(() => {
    // Initialize dummy statuses for demonstration
    const initial: Record<number, string> = {};
    staff.forEach((user, idx) => {
      // Alternate statuses for realism
      if (idx % 4 === 0) initial[user.id] = 'Late';
      else if (idx % 6 === 0) initial[user.id] = 'Absent';
      else if (idx % 8 === 0) initial[user.id] = 'Leave';
      else initial[user.id] = 'Present';
    });
    return initial;
  });

  const handleStatusChange = (userId: number, status: string) => {
    setAttendanceStates(prev => ({
      ...prev,
      [userId]: status,
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Present': return 'success-subtle text-success';
      case 'Late': return 'warning-subtle text-warning';
      case 'Absent': return 'danger-subtle text-danger';
      case 'Leave': return 'info-subtle text-info';
      default: return 'secondary-subtle text-secondary';
    }
  };

  const totalPresent = Object.values(attendanceStates).filter(s => s === 'Present' || s === 'Late').length;
  const totalLate = Object.values(attendanceStates).filter(s => s === 'Late').length;
  const totalAbsent = Object.values(attendanceStates).filter(s => s === 'Absent').length;
  const totalLeave = Object.values(attendanceStates).filter(s => s === 'Leave').length;

  return (
    <React.Fragment>
      <Head title="Staff Attendance Log | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Staff Attendance" pageTitle="HR" />

          {/* Quick Metrics Cards */}
          <Row className="mb-4">
            <Col sm={6} lg={3}>
              <Card className="card-animate border-0 shadow-sm bg-success text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-white-50 text-uppercase mb-2">Total Present</p>
                      <h2 className="mb-0 fw-bold">{totalPresent}</h2>
                    </div>
                    <div className="avatar-sm">
                      <span className="avatar-title bg-white-subtle rounded-circle fs-3 text-white">
                        <i className="ri-user-follow-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="card-animate border-0 shadow-sm bg-warning text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-white-50 text-uppercase mb-2">Late Check-ins</p>
                      <h2 className="mb-0 fw-bold">{totalLate}</h2>
                    </div>
                    <div className="avatar-sm">
                      <span className="avatar-title bg-white-subtle rounded-circle fs-3 text-white">
                        <i className="ri-time-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="card-animate border-0 shadow-sm bg-danger text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-white-50 text-uppercase mb-2">Absent</p>
                      <h2 className="mb-0 fw-bold">{totalAbsent}</h2>
                    </div>
                    <div className="avatar-sm">
                      <span className="avatar-title bg-white-subtle rounded-circle fs-3 text-white">
                        <i className="ri-user-unfollow-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="card-animate border-0 shadow-sm bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-white-50 text-uppercase mb-2">On Leave</p>
                      <h2 className="mb-0 fw-bold">{totalLeave}</h2>
                    </div>
                    <div className="avatar-sm">
                      <span className="avatar-title bg-white-subtle rounded-circle fs-3 text-white">
                        <i className="ri-plane-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Date Picker and Info */}
          <Row className="mb-4 align-items-center">
            <Col>
              <h5 className="mb-0 text-muted">Daily Attendance Ledger and Shift Personnel Verification</h5>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                <Form.Label className="mb-0 text-nowrap fw-semibold">Select Date:</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ width: '160px' }}
                />
              </div>
            </Col>
          </Row>

          {/* Main Grid */}
          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0">
                      <thead className="table-light text-muted">
                        <tr>
                          <th style={{ width: '120px' }}>Employee Code</th>
                          <th>Full Name</th>
                          <th>Designation</th>
                          <th className="text-center" style={{ width: '180px' }}>Log Status</th>
                          <th className="text-center" style={{ width: '300px' }}>Change Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center text-muted py-4">
                              No active staff registered.
                            </td>
                          </tr>
                        ) : (
                          staff.map((user) => (
                            <tr key={user.id}>
                              <td className="fw-bold font-monospace text-dark">{user.employee_code}</td>
                              <td>
                                <div className="fw-semibold text-primary">{user.name}</div>
                              </td>
                              <td>{user.designation || <span className="text-muted fs-12">N/A</span>}</td>
                              <td className="text-center">
                                <Badge bg="" className={getStatusBadgeColor(attendanceStates[user.id] || 'Present')}>
                                  {attendanceStates[user.id] || 'Present'}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-1">
                                  <Button
                                    variant={attendanceStates[user.id] === 'Present' ? 'success' : 'outline-success'}
                                    size="sm"
                                    onClick={() => handleStatusChange(user.id, 'Present')}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    variant={attendanceStates[user.id] === 'Late' ? 'warning' : 'outline-warning'}
                                    size="sm"
                                    onClick={() => handleStatusChange(user.id, 'Late')}
                                  >
                                    Late
                                  </Button>
                                  <Button
                                    variant={attendanceStates[user.id] === 'Absent' ? 'danger' : 'outline-danger'}
                                    size="sm"
                                    onClick={() => handleStatusChange(user.id, 'Absent')}
                                  >
                                    Absent
                                  </Button>
                                  <Button
                                    variant={attendanceStates[user.id] === 'Leave' ? 'info' : 'outline-info'}
                                    size="sm"
                                    onClick={() => handleStatusChange(user.id, 'Leave')}
                                  >
                                    Leave
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
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

Attendance.layout = (page: any) => <Layout children={page} />;
export default Attendance;
