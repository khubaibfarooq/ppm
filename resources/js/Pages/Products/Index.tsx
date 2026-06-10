import React, { useState } from 'react';
import { Card, Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Layouts';
import BreadCrumb from '@/Components/Common/BreadCrumb';

interface Product {
  id: number;
  name: string;
  code: string;
  unit: string;
  type: 'fuel' | 'lubricant' | 'other';
  current_price: number;
  current_cost: number;
  is_active: boolean;
  revenue_account?: { code: string; name: string };
  cogs_account?: { code: string; name: string };
  inventory_account?: { code: string; name: string };
}

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface Props {
  products: Product[];
  accounts: Account[];
}

const Index = ({ products, accounts }: Props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add Product Form
  const addForm = useForm({
    name: '',
    code: '',
    unit: 'Liters',
    type: 'fuel',
    current_price: '',
    current_cost: '',
    revenue_account_id: '',
    cogs_account_id: '',
    inventory_account_id: '',
  });

  // Price Form
  const priceForm = useForm({
    current_cost: 0,
    current_price: 0,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post(route('products.store'), {
      onSuccess: () => {
        addForm.reset();
        setShowAddModal(false);
      }
    });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    priceForm.post(route('products.price', selectedProduct.id), {
      onSuccess: () => {
        priceForm.reset();
        setShowPriceModal(false);
      }
    });
  };

  const openPriceUpdate = (product: Product) => {
    setSelectedProduct(product);
    priceForm.setData({
      current_cost: product.current_cost,
      current_price: product.current_price,
    });
    setShowPriceModal(true);
  };

  return (
    <React.Fragment>
      <Head title="Products Registry | Station Manager" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Products" pageTitle="Inventory" />

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-muted">Manage product catalog and double-entry general ledger configurations</h5>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="ri-add-line align-bottom me-1"></i> Register Product
              </Button>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="table-responsive">
                    <Table bordered hover align="middle" className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Code</th>
                          <th>Product Name</th>
                          <th>Type</th>
                          <th>Unit</th>
                          <th className="text-end">Cost Price</th>
                          <th className="text-end">Selling Price</th>
                          <th>GL Account Mappings</th>
                          <th>Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="fw-bold text-dark">{product.code}</td>
                            <td className="fw-semibold text-primary">{product.name}</td>
                            <td>
                              <span className={`badge text-uppercase ${
                                product.type === 'fuel' 
                                  ? 'bg-primary-subtle text-primary' 
                                  : product.type === 'lubricant' 
                                    ? 'bg-warning-subtle text-warning' 
                                    : 'bg-dark-subtle text-dark'
                              }`}>
                                {product.type}
                              </span>
                            </td>
                            <td>{product.unit}</td>
                            <td className="text-end font-monospace">PKR {parseFloat(product.current_cost.toString()).toLocaleString()}</td>
                            <td className="text-end font-monospace text-primary fw-medium">PKR {parseFloat(product.current_price.toString()).toLocaleString()}</td>
                            <td>
                              <div className="fs-12 text-muted">
                                <div><span className="fw-semibold text-dark">Inv:</span> {product.inventory_account ? `${product.inventory_account.code} - ${product.inventory_account.name}` : '-'}</div>
                                <div><span className="fw-semibold text-dark">Rev:</span> {product.revenue_account ? `${product.revenue_account.code} - ${product.revenue_account.name}` : '-'}</div>
                                <div><span className="fw-semibold text-dark">COGS:</span> {product.cogs_account ? `${product.cogs_account.code} - ${product.cogs_account.name}` : '-'}</div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${product.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <Button variant="soft-warning" size="sm" onClick={() => openPriceUpdate(product)}>
                                <i className="ri-price-tag-3-line align-bottom me-1"></i> Update Pricing
                              </Button>
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

          {/* Add Product Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Register Product</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Premium Petrol"
                      value={addForm.data.name}
                      onChange={e => addForm.setData('name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Product Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. PMG"
                      value={addForm.data.code}
                      onChange={e => addForm.setData('code', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Product Type</Form.Label>
                    <Form.Select
                      value={addForm.data.type}
                      onChange={e => addForm.setData('type', e.target.value as any)}
                      required
                    >
                      <option value="fuel">Fuel</option>
                      <option value="lubricant">Lubricant</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Unit of Measure</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Liters"
                      value={addForm.data.unit}
                      onChange={e => addForm.setData('unit', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Cost Price (PKR)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={addForm.data.current_cost}
                      onChange={e => addForm.setData('current_cost', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Retail Selling Price (PKR)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={addForm.data.current_price}
                      onChange={e => addForm.setData('current_price', e.target.value)}
                      required
                    />
                  </Col>
                  
                  <Col lg={12} className="mt-3 border-top pt-3">
                    <h6 className="fw-semibold mb-3">Double-Entry Ledger Account Mappings</h6>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Form.Label>Inventory Account</Form.Label>
                    <Form.Select
                      value={addForm.data.inventory_account_id}
                      onChange={e => addForm.setData('inventory_account_id', e.target.value)}
                    >
                      <option value="">-- Mapped Asset Account --</option>
                      {accounts.filter(a => a.type === 'asset').map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Revenue Account</Form.Label>
                    <Form.Select
                      value={addForm.data.revenue_account_id}
                      onChange={e => addForm.setData('revenue_account_id', e.target.value)}
                    >
                      <option value="">-- Mapped Revenue Account --</option>
                      {accounts.filter(a => a.type === 'revenue').map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>COGS Account</Form.Label>
                    <Form.Select
                      value={addForm.data.cogs_account_id}
                      onChange={e => addForm.setData('cogs_account_id', e.target.value)}
                    >
                      <option value="">-- Mapped Expense Account --</option>
                      {accounts.filter(a => a.type === 'expense').map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowAddModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={addForm.processing}>Save Product</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Update Price Modal */}
          <Modal show={showPriceModal} onHide={() => setShowPriceModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Update Product Price - {selectedProduct?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handlePriceSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <Form.Label>Cost Price (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={priceForm.data.current_cost}
                    onChange={e => priceForm.setData('current_cost', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Retail Selling Price (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={priceForm.data.current_price}
                    onChange={e => priceForm.setData('current_price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" onClick={() => setShowPriceModal(false)}>Close</Button>
                <Button type="submit" variant="primary" disabled={priceForm.processing}>Update Price</Button>
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
