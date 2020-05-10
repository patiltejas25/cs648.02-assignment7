// /* globals React */
// /* eslint "react/jsx-no-undef": "off" */

import React from 'react';
import { Route } from 'react-router-dom';
import ProductTable from './ProductTable.jsx';
import ProductAdd from './ProductAdd.jsx';
import ProductDetail from './ProductDetail.jsx';
import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';


export default class ProductList extends React.Component {
  constructor() {
    super();
    this.state = {
      products: [],
      toastVisible: false,
      toastMessage: ' ',
      toastType: 'info',
      count: null,
    };

    this.addProduct = this.addProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
    this.getCount = this.getCount.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async getCount() {
    const query = `query{
      productCount{
        total
      }
    }`;

    const response = await fetch(window.ENV.UI_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const result = await response.json();
    this.setState({ count: result.data.productCount.total });
  }

  async loadData() {
    const query = `query {
          productList {
            id name  price category
            image 
          }
        }`;
    const response = await fetch(window.ENV.UI_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const result = await response.json();
    this.setState({ products: result.data.productList });
    this.getCount();
  }

  async addProduct(product) {
    const query = `mutation productAdd($product: ProductInputs!) {
            productAdd(product: $product) {
              id
            }
          }`;


    await fetch(window.ENV.UI_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { product } }),
    });

    this.loadData();
  }

  async deleteProduct(index) {
    const query = `mutation productDelete($id: Int!) {
      productDelete(id: $id)
    }`;
    const { products } = this.state;
    const { location: { pathname, search }, history } = this.props;
    const { id } = products[index];
    const data = await graphQLFetch(query, { id }, this.showError);
    if (data && data.productDelete) {
      this.setState((prevState) => {
        const newList = [...prevState.products];
        if (pathname === `/products/${id}`) {
          history.push({ pathname: '/products', search });
        }
        newList.splice(index, 1);
        this.getCount();
        return { products: newList };
      });
      this.showSuccess(`Deleted product ${id} successfully.`);
    } else {
      this.loadData();
    }
  }

  showSuccess(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }

  render() {
    const { products, count } = this.state;
    const { toastVisible, toastType, toastMessage } = this.state;
    const { match } = this.props;

    return (
      <React.Fragment>
        <ProductTable
          products={products}
          deleteProduct={this.deleteProduct}
          count={count}
        />
        <ProductAdd addProduct={this.addProduct} />
        <Route path={`${match.path}/:id`} component={ProductDetail} />
        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}
