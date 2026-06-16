import React, { useState, useEffect } from 'react';
import { Card, Col, Container, Row, Button, Form, ListGroup, Badge, Alert } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface Props {
  roles: Role[];
  permissions: Permission[];
}

const permissionGroupsDef: Record<string, string[]> = {
  'Stations': ['view stations', 'manage stations'],
  'Staff Directory & Payroll': ['view staff', 'manage staff', 'process salary'],
  'Shifts': ['view shifts', 'manage shifts', 'open shift', 'close shift', 'verify shift'],
  'Readings': ['record meter readings', 'record dip readings', 'record cash collections'],
  'Tanks': ['view tanks', 'manage tanks', 'record deliveries'],
  'Machines & Nozzles': ['view machines', 'manage machines'],
  'Products': ['view products', 'manage products', 'update prices'],
  'Accounting': ['view accounts', 'manage accounts', 'view journals', 'post journals', 'reverse journals'],
  'Customers & Suppliers': ['manage customers', 'manage suppliers', 'receive payments', 'make payments'],
  'Reports & Exports': ['view reports', 'export reports'],
};

const Index = ({ roles, permissions }: Props) => {
  // Select first non-super-admin role as default if possible, otherwise first role
  const initialRole = roles.find(r => r.name !== 'super_admin') || roles[0];
  const [activeRole, setActiveRole] = useState<Role | null>(initialRole || null);

  const form = useForm({
    permissions: [] as string[],
  });

  // Update form state when active role changes
  useEffect(() => {
    if (activeRole) {
      form.setData({
        permissions: activeRole.permissions.map(p => p.name),
      });
    }
  }, [activeRole]);

  // Compute dynamic groups
  const groupedPermissions = (() => {
    const grouped: Record<string, string[]> = {};
    Object.keys(permissionGroupsDef).forEach(key => {
      grouped[key] = [];
    });
    grouped['Other'] = [];

    permissions.forEach(p => {
      let found = false;
      for (const [key, list] of Object.entries(permissionGroupsDef)) {
        if (list.includes(p.name)) {
          grouped[key].push(p.name);
          found = true;
          break;
        }
      }
      if (!found) {
        grouped['Other'].push(p.name);
      }
    });

    return Object.fromEntries(
      Object.entries(grouped).filter(([_, list]) => list.length > 0)
    );
  })();

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      form.setData('permissions', [...form.data.permissions, name]);
    } else {
      form.setData('permissions', form.data.permissions.filter(p => p !== name));
    }
  };

  const handleSelectAllInGroup = (groupName: string, groupPerms: string[]) => {
    const otherPerms = form.data.permissions.filter(p => !groupPerms.includes(p));
    form.setData('permissions', [...otherPerms, ...groupPerms]);
  };

  const handleClearAllInGroup = (groupName: string, groupPerms: string[]) => {
    const otherPerms = form.data.permissions.filter(p => !groupPerms.includes(p));
    form.setData('permissions', otherPerms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole) return;

    form.put(route('roles.update', activeRole.id), {
      onSuccess: () => {
        // Refresh local state of the role with new permissions
        const updatedRole = roles.find(r => r.id === activeRole.id);
        if (updatedRole) {
          setActiveRole(updatedRole);
        }
      }
    });
  };

  return (
    <React.Fragment>
      <Head title="Access Control | Global Admin" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Roles & Permissions" pageTitle="Global Management" />

          <Row className="mb-4">
            <Col>
              <h5 className="mb-0 text-dark">Access Control List (ACL)</h5>
              <p className="text-muted mb-0 fs-13">Configure Spatie authorization roles and granular resource access permissions</p>
            </Col>
          </Row>

          <Row>
            {/* Roles Sidebar List */}
            <Col lg={4} className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light">
                  <h6 className="card-title mb-0 fw-semibold">Select Role</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush" className="mail-list">
                    {roles.map(role => (
                      <ListGroup.Item
                        key={role.id}
                        action
                        active={activeRole?.id === role.id}
                        onClick={() => setActiveRole(role)}
                        className="d-flex justify-content-between align-items-center py-3 px-4"
                      >
                        <span className="fw-semibold text-uppercase text-truncate" style={{ maxWidth: '70%' }}>
                          {role.name.replace('_', ' ')}
                        </span>
                        <Badge bg={role.name === 'super_admin' ? 'danger' : 'info'} pill>
                          {role.permissions.length} perms
                        </Badge>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Permissions Checkbox Panel */}
            <Col lg={8}>
              {activeRole ? (
                <Form onSubmit={handleSubmit}>
                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3">
                      <div>
                        <h6 className="card-title mb-0 fw-bold text-uppercase text-primary">
                          {activeRole.name.replace('_', ' ')}
                        </h6>
                        <small className="text-muted">Configure access rights for this user level</small>
                      </div>
                      {activeRole.name !== 'super_admin' && (
                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="sm" 
                          disabled={form.processing}
                        >
                          <i className="ri-save-3-line align-bottom me-1"></i> 
                          {form.processing ? 'Saving...' : 'Save Permissions'}
                        </Button>
                      )}
                    </Card.Header>
                    <Card.Body className="p-4">
                      {activeRole.name === 'super_admin' ? (
                        <Alert variant="warning" className="border-0 shadow-sm py-3 mb-0">
                          <i className="ri-alert-line align-middle me-2 fs-18"></i>
                          The **Super Admin** role has all permissions enabled by default. These system-level permissions are protected and cannot be edited.
                        </Alert>
                      ) : (
                        Object.entries(groupedPermissions).map(([groupName, groupPerms]) => {
                          const allChecked = groupPerms.every(p => form.data.permissions.includes(p));
                          return (
                            <Card key={groupName} className="mb-4 border border-light">
                              <Card.Header className="bg-light-subtle d-flex justify-content-between align-items-center py-2 px-3">
                                <span className="fw-bold text-dark fs-14">{groupName}</span>
                                <div className="d-flex gap-2">
                                  <Button 
                                    type="button" 
                                    variant="link" 
                                    className="p-0 text-decoration-none fs-11 text-primary fw-medium"
                                    onClick={() => handleSelectAllInGroup(groupName, groupPerms)}
                                  >
                                    Select All
                                  </Button>
                                  <span className="text-muted fs-11">|</span>
                                  <Button 
                                    type="button" 
                                    variant="link" 
                                    className="p-0 text-decoration-none fs-11 text-muted fw-medium"
                                    onClick={() => handleClearAllInGroup(groupName, groupPerms)}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </Card.Header>
                              <Card.Body className="py-3 px-4">
                                <Row>
                                  {groupPerms.map(permName => (
                                    <Col md={6} key={permName} className="py-2">
                                      <Form.Check 
                                        type="checkbox"
                                        id={`perm-${permName}`}
                                        label={permName.replace('_', ' ')}
                                        checked={form.data.permissions.includes(permName)}
                                        onChange={e => handleCheckboxChange(permName, e.target.checked)}
                                        className="fw-medium text-muted"
                                      />
                                    </Col>
                                  ))}
                                </Row>
                              </Card.Body>
                            </Card>
                          );
                        })
                      )}
                    </Card.Body>
                    {activeRole.name !== 'super_admin' && (
                      <Card.Footer className="bg-light d-flex justify-content-end py-3 px-4">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          disabled={form.processing}
                        >
                          <i className="ri-save-3-line align-bottom me-1"></i> 
                          {form.processing ? 'Saving...' : 'Save Permissions'}
                        </Button>
                      </Card.Footer>
                    )}
                  </Card>
                </Form>
              ) : (
                <Card className="shadow-sm border-0 text-center py-5 text-muted">
                  <Card.Body>
                    <i className="ri-shield-user-line fs-48 text-light mb-3 d-block"></i>
                    Please select a role to configure permissions.
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

        </Container>
      </div>
    </React.Fragment>
  );
};

Index.layout = (page: any) => <Layout children={page} />;
export default Index;
