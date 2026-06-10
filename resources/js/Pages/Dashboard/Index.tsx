import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';
import ReactApexChart from 'react-apexcharts';

interface Props {
  todayRevenue: number;
  todayLiters: number;
  openShiftsCount: number;
  alertsCount: number;
  salesData: { name: string; liters: number; amount: number }[];
  tankLevels: { name: string; product: string; percentage: number; current: number; capacity: number }[];
}

const Dashboard = ({ todayRevenue, todayLiters, openShiftsCount, alertsCount, salesData, tankLevels }: Props) => {
  // Bar chart options for sales by product
  const chartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '35%', borderRadius: 4 }
    },
    xaxis: {
      categories: salesData.map(item => item.name)
    },
    colors: ['#3577f1'],
    grid: { borderColor: '#f1f1f1' }
  };

  const chartSeries = [
    {
      name: 'Liters Sold',
      data: salesData.map(item => item.liters)
    }
  ];

  return (
    <React.Fragment>
      <Head title="Dashboard | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="Overview" />
          
          {/* Metrics Row */}
          <Row>
            <Col xl={3} md={6}>
              <Card className="card-animate shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-semibold text-muted text-truncate mb-0">Today's Revenue</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-bold ff-secondary mb-4 text-primary">PKR {todayRevenue.toLocaleString()}</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-success-subtle rounded-circle fs-3 p-3">
                        <i className="ri-money-dollar-circle-line text-success"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="card-animate shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-semibold text-muted text-truncate mb-0">Liters Sold</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-bold ff-secondary mb-4 text-info">{todayLiters.toLocaleString()} L</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-info-subtle rounded-circle fs-3 p-3">
                        <i className="ri-gas-station-line text-info"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="card-animate shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-semibold text-muted text-truncate mb-0">Open Shifts</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-bold ff-secondary mb-4 text-warning">{openShiftsCount}</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-warning-subtle rounded-circle fs-3 p-3">
                        <i className="ri-time-line text-warning"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6}>
              <Card className="card-animate shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-semibold text-muted text-truncate mb-0">Active Alarms</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-bold ff-secondary mb-4 text-danger">{alertsCount}</h4>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className={`avatar-title ${alertsCount > 0 ? 'bg-danger-subtle text-danger' : 'bg-light text-muted'} rounded-circle fs-3 p-3`}>
                        <i className="ri-error-warning-line"></i>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Sales Chart */}
            <Col xl={8}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Product Sales today (Liters)</h5>
                </Card.Header>
                <Card.Body>
                  {salesData.length > 0 ? (
                    <ReactApexChart
                      options={chartOptions}
                      series={chartSeries}
                      type="bar"
                      height={350}
                    />
                  ) : (
                    <p className="text-center text-muted py-5">No sales logs today.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Tank Status Levels */}
            <Col xl={4}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold">Fuel Tank Inventory levels</h5>
                </Card.Header>
                <Card.Body>
                  {tankLevels.map((tank, i) => (
                    <div key={i} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-dark">{tank.name} <span className="text-muted fs-12">({tank.product})</span></span>
                        <span className="text-muted fs-12 fw-medium">{tank.current.toLocaleString()} / {tank.capacity.toLocaleString()} L ({tank.percentage}%)</span>
                      </div>
                      <div className="progress progress-sm" style={{ height: '10px' }}>
                        <div
                          className={`progress-bar ${tank.percentage < 20 ? 'bg-danger' : tank.percentage < 50 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${tank.percentage}%` }}
                          aria-valuenow={tank.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

Dashboard.layout = (page: any) => <Layout children={page} />;
export default Dashboard;
