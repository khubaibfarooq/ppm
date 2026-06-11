import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Props {
  shifts: Shift[];
}

const Templates = ({ shifts }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  // Form for creating a new shift
  const addForm = useForm({
    name: '',
    start_time: '',
    end_time: '',
  });

  // Form for editing an existing shift
  const editForm = useForm({
    name: '',
    start_time: '',
    end_time: '',
    is_active: true,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('shifts.store'), {
      onSuccess: () => {
        setShowAddModal(false);
        addForm.reset();
      },
    });
  };

  const handleEditClick = (shift: Shift) => {
    setCurrentShift(shift);
    editForm.setData({
      name: shift.name,
      start_time: shift.start_time.substring(0, 5), // Ensure H:i format
      end_time: shift.end_time.substring(0, 5),     // Ensure H:i format
      is_active: shift.is_active,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;
    editForm.put(route('shifts.update', currentShift.id), {
      onSuccess: () => {
        setShowEditModal(false);
        setCurrentShift(null);
        editForm.reset();
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this shift template?')) {
      const deleteForm = useForm();
      deleteForm.delete(route('shifts.destroy', id));
    }
  };

  return (
    <React.Fragment>
      <Head title="Shift Templates | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Shift Templates" pageTitle="Shifts" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Configure shift schedules and templates</h5>
              <Button 
                variant="primary" 
                className="btn-label waves-effect waves-light"
                onClick={() => setShowAddModal(true)}
              >
                <i className="ri-add-line label-icon align-middle fs-16 me-2"></i> Add Shift Template
              </Button>
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
                          <th>Name</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shifts.length > 0 ? (
                          shifts.map((shift) => (
                            <tr key={shift.id}>
                              <td className="fw-semibold text-primary">{shift.name}</td>
                              <td className="font-monospace">{shift.start_time}</td>
                              <td className="font-monospace">{shift.end_time}</td>
                              <td>
                                <span className={`badge ${shift.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} text-uppercase`}>
                                  {shift.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="text-center">
                                <Button 
                                  variant="soft-warning" 
                                  size="sm" 
                                  className="me-2"
                                  onClick={() => handleEditClick(shift)}
                                >
                                  <i className="ri-edit-line align-bottom me-1"></i> Edit
                                </Button>
                                <Button 
                                  variant="soft-danger" 
                                  size="sm"
                                  onClick={() => handleDelete(shift.id)}
                                >
                                  <i className="ri-delete-bin-line align-bottom me-1"></i> Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center text-muted py-5">
                              No shift templates configured. Click "Add Shift Template" to create one.
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

          {/* Add Shift Template Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Create Shift Template</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Shift Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Morning Shift"
                    value={addForm.data.name}
                    onChange={e => addForm.setData('name', e.target.value)}
                    isInvalid={!!addForm.errors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{addForm.errors.name}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={addForm.data.start_time}
                        onChange={e => addForm.setData('start_time', e.target.value)}
                        isInvalid={!!addForm.errors.start_time}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{addForm.errors.start_time}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">End Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={addForm.data.end_time}
                        onChange={e => addForm.setData('end_time', e.target.value)}
                        isInvalid={!!addForm.errors.end_time}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{addForm.errors.end_time}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Close</Button>
                <Button variant="primary" type="submit" disabled={addForm.processing}>
                  {addForm.processing ? 'Saving...' : 'Save Template'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Edit Shift Template Modal */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Edit Shift Template</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Shift Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Morning Shift"
                    value={editForm.data.name}
                    onChange={e => editForm.setData('name', e.target.value)}
                    isInvalid={!!editForm.errors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editForm.errors.name}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={editForm.data.start_time}
                        onChange={e => editForm.setData('start_time', e.target.value)}
                        isInvalid={!!editForm.errors.start_time}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{editForm.errors.start_time}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">End Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={editForm.data.end_time}
                        onChange={e => editForm.setData('end_time', e.target.value)}
                        isInvalid={!!editForm.errors.end_time}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{editForm.errors.end_time}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is-active-switch"
                    label="Active Status"
                    className="fw-semibold"
                    checked={editForm.data.is_active}
                    onChange={e => editForm.setData('is_active', e.target.checked)}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowEditModal(false)}>Close</Button>
                <Button variant="warning" type="submit" disabled={editForm.processing}>
                  {editForm.processing ? 'Saving...' : 'Update Template'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

Templates.layout = (page: any) => <Layout children={page} />;
export default Templates;
