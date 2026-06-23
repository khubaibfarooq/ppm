import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Station {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  license_number: string | null;
  is_active: boolean;
}

interface Props {
  stations: Station[];
}

const Index = ({ stations }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Add Station Form
  const addForm = useForm({
    name: '',
    address: '',
    phone: '',
    license_number: '',
  });

  // Edit Station Form
  const editForm = useForm({
    name: '',
    address: '',
    phone: '',
    license_number: '',
    is_active: true,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('stations.store'), {
      onSuccess: () => {
        addForm.reset();
        setShowAddModal(false);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;
    editForm.put(route('stations.update', selectedStation.id), {
      onSuccess: () => {
        editForm.reset();
        setShowEditModal(false);
      }
    });
  };

  const openEditModal = (station: Station) => {
    setSelectedStation(station);
    editForm.setData({
      name: station.name,
      address: station.address || '',
      phone: station.phone || '',
      license_number: station.license_number || '',
      is_active: station.is_active,
    });
    setShowEditModal(true);
  };

  const toggleStatus = (station: Station) => {
    if (confirm(`Are you sure you want to ${station.is_active ? 'deactivate' : 'activate'} this station?`)) {
      useForm().put(route('stations.update', station.id), {
        data: {
          name: station.name,
          address: station.address || '',
          phone: station.phone || '',
          license_number: station.license_number || '',
          is_active: !station.is_active,
        }
      });
    }
  };

  return (
    <React.Fragment>
      <Head title="Stations Registry | Global Admin" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Stations" pageTitle="Global Management" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-dark">Stations Registry</h5>
                <p className="text-muted mb-0 fs-13">Configure and monitor retail petroleum stations across the SaaS platform</p>
              </div>
              <Button variant="primary" onClick={() => setShowAddModal(true)} className="add-btn">
                <i className="ri-add-line align-bottom me-1"></i> Register New Station
              </Button>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle mb-0 table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Station Name</th>
                          <th>License Number</th>
                          <th>Phone</th>
                          <th>Address</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.length > 0 ? (
                          stations.map((station) => (
                            <tr key={station.id}>
                              <td className="fw-bold text-muted">#{station.id}</td>
                              <td className="fw-semibold text-primary">{station.name}</td>
                              <td>
                                <span className="text-dark font-monospace">{station.license_number || 'N/A'}</span>
                              </td>
                              <td>{station.phone || 'N/A'}</td>
                              <td className="text-truncate" style={{ maxWidth: '250px' }}>{station.address || 'N/A'}</td>
                              <td className="text-center">
                                <span className={`badge ${station.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fs-11`}>
                                  {station.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button variant="soft-warning" size="sm" onClick={() => openEditModal(station)}>
                                    <i className="ri-edit-2-line"></i> Edit
                                  </Button>
                                  <Button
                                    variant={station.is_active ? "soft-danger" : "soft-success"}
                                    size="sm"
                                    onClick={() => toggleStatus(station)}
                                  >
                                    <i className={station.is_active ? "ri-close-circle-line" : "ri-checkbox-circle-line"}></i> {station.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              No stations registered yet. Click "Register New Station" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Add Station Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
            <Modal.Header closeButton className="bg-light p-3">
              <Modal.Title className="fw-bold">Register New Station</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body className="p-4">
                <Row>
                  <Col lg={12} className="mb-3">
                    <Form.Label className="form-label">Station Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Main Street Station"
                      value={addForm.data.name}
                      onChange={e => addForm.setData('name', e.target.value)}
                      isInvalid={!!addForm.errors.name}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{addForm.errors.name}</Form.Control.Feedback>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">OGRA License Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. OGRA-PET-2026-9918"
                      value={addForm.data.license_number}
                      onChange={e => addForm.setData('license_number', e.target.value)}
                      isInvalid={!!addForm.errors.license_number}
                    />
                    <Form.Control.Feedback type="invalid">{addForm.errors.license_number}</Form.Control.Feedback>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. +92-51-111-222-333"
                      value={addForm.data.phone}
                      onChange={e => addForm.setData('phone', e.target.value)}
                      isInvalid={!!addForm.errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">{addForm.errors.phone}</Form.Control.Feedback>
                  </Col>

                  <Col lg={12} className="mb-3">
                    <Form.Label className="form-label">Station Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter full address details..."
                      value={addForm.data.address}
                      onChange={e => addForm.setData('address', e.target.value)}
                      isInvalid={!!addForm.errors.address}
                    />
                    <Form.Control.Feedback type="invalid">{addForm.errors.address}</Form.Control.Feedback>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={addForm.processing}>
                  {addForm.processing ? 'Registering...' : 'Register Station'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Edit Station Modal */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
            <Modal.Header closeButton className="bg-light p-3">
              <Modal.Title className="fw-bold">Edit Station Settings - {selectedStation?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditSubmit}>
              <Modal.Body className="p-4">
                <Row>
                  <Col lg={12} className="mb-3">
                    <Form.Label className="form-label">Station Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm.data.name}
                      onChange={e => editForm.setData('name', e.target.value)}
                      isInvalid={!!editForm.errors.name}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{editForm.errors.name}</Form.Control.Feedback>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">OGRA License Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm.data.license_number}
                      onChange={e => editForm.setData('license_number', e.target.value)}
                      isInvalid={!!editForm.errors.license_number}
                    />
                    <Form.Control.Feedback type="invalid">{editForm.errors.license_number}</Form.Control.Feedback>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm.data.phone}
                      onChange={e => editForm.setData('phone', e.target.value)}
                      isInvalid={!!editForm.errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">{editForm.errors.phone}</Form.Control.Feedback>
                  </Col>

                  <Col lg={12} className="mb-3">
                    <Form.Label className="form-label">Station Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editForm.data.address}
                      onChange={e => editForm.setData('address', e.target.value)}
                      isInvalid={!!editForm.errors.address}
                    />
                    <Form.Control.Feedback type="invalid">{editForm.errors.address}</Form.Control.Feedback>
                  </Col>

                  <Col lg={12} className="mb-3">
                    <Form.Check
                      type="switch"
                      id="station-status-switch"
                      label="Mark Station as Active"
                      checked={editForm.data.is_active}
                      onChange={e => editForm.setData('is_active', e.target.checked)}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={editForm.processing}>
                  {editForm.processing ? 'Saving...' : 'Save Changes'}
                </Button>
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
