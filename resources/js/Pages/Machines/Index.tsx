import React, { useState } from 'react';
import { Card, Col, Container, Row, Button, Modal, Form, Table } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Nozzle {
  id: number;
  label: string;
  is_active: boolean;
  tank: { name: string };
  product: { name: string };
}

interface Machine {
  id: number;
  name: string;
  serial_number: string;
  brand: string;
  is_active: boolean;
  nozzles: Nozzle[];
}

interface Tank {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface Props {
  machines: Machine[];
  tanks: Tank[];
  products: Product[];
}

const Index = ({ machines, tanks, products }: Props) => {
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showNozzleModal, setShowNozzleModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // Machine Form
  const machineForm = useForm({
    name: '',
    serial_number: '',
    brand: '',
  });

  // Nozzle Form
  const nozzleForm = useForm({
    tank_id: tanks.length > 0 ? tanks[0].id : '',
    product_id: products.length > 0 ? products[0].id : '',
    label: '',
  });

  const handleMachineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    machineForm.post(route('machines.store'), {
      onSuccess: () => {
        machineForm.reset();
        setShowMachineModal(false);
      }
    });
  };

  const handleNozzleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    nozzleForm.post(route('machines.nozzles.store', selectedMachine.id), {
      onSuccess: () => {
        nozzleForm.reset();
        setShowNozzleModal(false);
      }
    });
  };

  const openAddNozzle = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowNozzleModal(true);
  };

  return (
    <React.Fragment>
      <Head title="Dispenser Units | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dispenser Machines" pageTitle="Inventory" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Dispenser units and nozzle layouts configuration</h5>
              <Button variant="primary" onClick={() => setShowMachineModal(true)}>
                <i className="ri-add-line align-bottom me-1"></i> Add Dispenser Unit
              </Button>
            </Col>
          </Row>

          <Row>
            {machines.map((machine) => (
              <Col lg={6} key={machine.id} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Header className="bg-transparent border-0 pt-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-0 fw-bold">{machine.name}</h5>
                      <span className="text-muted fs-12">Serial: {machine.serial_number || '-'} | Brand: {machine.brand || '-'}</span>
                    </div>
                    <Button variant="soft-primary" size="sm" onClick={() => openAddNozzle(machine)}>
                      <i className="ri-add-line align-bottom me-1"></i> Add Nozzle
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive mt-3">
                      <Table bordered hover size="sm" className="align-middle mb-0">
                        <thead className="table-light fs-12">
                          <tr>
                            <th>Nozzle Label</th>
                            <th>Fuel Product</th>
                            <th>Storage Tank</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {machine.nozzles.map((nozzle) => (
                            <tr key={nozzle.id}>
                              <td className="fw-semibold text-primary">{nozzle.label}</td>
                              <td>{nozzle.product.name}</td>
                              <td>{nozzle.tank.name}</td>
                              <td>
                                <span className={`badge ${nozzle.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                  {nozzle.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {machine.nozzles.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center text-muted py-4 fs-12">No nozzles configured for this dispenser.</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Machine Modal */}
          <Modal show={showMachineModal} onHide={() => setShowMachineModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Add Dispenser Machine</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleMachineSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Machine Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Dispenser Unit 1"
                    value={machineForm.data.name}
                    onChange={e => machineForm.setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. TK-2001"
                    value={machineForm.data.serial_number}
                    onChange={e => machineForm.setData('serial_number', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Brand / Manufacturer</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Tokheim"
                    value={machineForm.data.brand}
                    onChange={e => machineForm.setData('brand', e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowMachineModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={machineForm.processing}>Save Machine</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Nozzle Modal */}
          <Modal show={showNozzleModal} onHide={() => setShowNozzleModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Add Nozzle to {selectedMachine?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleNozzleSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Nozzle Label</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. PMG-01"
                    value={nozzleForm.data.label}
                    onChange={e => nozzleForm.setData('label', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Connected Fuel Tank</Form.Label>
                  <Form.Select
                    value={nozzleForm.data.tank_id}
                    onChange={e => nozzleForm.setData('tank_id', e.target.value)}
                    required
                  >
                    <option value="">-- Choose Storage Tank --</option>
                    {tanks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Form.Select>
                </div>
                <div className="mb-3">
                  <Form.Label>Fuel Product Type</Form.Label>
                  <Form.Select
                    value={nozzleForm.data.product_id}
                    onChange={e => nozzleForm.setData('product_id', e.target.value)}
                    required
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowNozzleModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={nozzleForm.processing}>Save Nozzle</Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
