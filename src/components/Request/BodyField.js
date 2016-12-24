import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray } from 'redux-form';
import {
  FormGroup,
  FormControl,
  Checkbox,
  Button,
  Col,
} from 'react-bootstrap';

import Fonticon from 'components/Fonticon';
import Collapsable from 'components/Collapsable';
import * as RequestActions from 'store/request/actions';

function renderField({ input, placeholder }) {
  return (
    <FormControl
      type="text"
      placeholder={placeholder}
      {...input}
    />
  );
}

renderField.propTypes = {
  input: PropTypes.shape({}).isRequired,
  placeholder: PropTypes.string.isRequired,
};

function renderFormDataFields({ fields, meta, setUseFormData }) {
  return (
    <Collapsable
      title="Request body"
      id="requestBody"
    >
      <Col xs={12}>
        <Checkbox
          checked
          onChange={() => { setUseFormData(false); }}
        >
          Use form data
        </Checkbox>
      </Col>
      {fields.map((field, key) => (
        <FormGroup
          key={key}
          controlId={`requestBodyGroup${key}`}
          validationState={meta.invalid ? 'error' : null}
        >
          <Col xs={5}>
            <Field
              name={`${field}.name`}
              component={renderField}
              placeholder="Name"
            />
          </Col>
          <Col xs={6}>
            <Field
              name={`${field}.value`}
              component={renderField}
              placeholder="Value"
            />
          </Col>
          <Col xs={1}>
            <Button
              id={`removeFormDataButton${key}`}
              onClick={() => fields.remove(key)}
            >
              <Fonticon icon="trash" />
              <span className="sr-only">
                Remove form field
              </span>
            </Button>
          </Col>
        </FormGroup>
      ))}
      <Col xs={12}>
        <Button
          id="addParameter"
          onClick={() => fields.push({})}
        >
          <Fonticon icon="plus" />
          Add parameter
        </Button>
      </Col>
    </Collapsable>
  );
}

/* eslint-disable react/no-unused-prop-types */
renderFormDataFields.propTypes = {
  setUseFormData: PropTypes.func.isRequired,
  fields: PropTypes.shape({
    map: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    invalid: PropTypes.bool.isRequired,
  }).isRequired,
};
/* eslint-enable react/no-unused-prop-types */

function renderDataField({ input, setUseFormData }) {
  return (
    <Collapsable
      title="Request body"
      id="requestBody"
    >
      <Col xs={12}>
        <Checkbox
          onChange={() => { setUseFormData(true); }}
        >
          Use form data
        </Checkbox>
      </Col>

      <Col xs={12}>
        <FormGroup controlId="requestBody">
          <FormControl
            componentClass="textarea"
            rows={10}
            {...input}
          />
        </FormGroup>
      </Col>
    </Collapsable>
  );
}

renderDataField.propTypes = {
  input: PropTypes.shape({}).isRequired,
  setUseFormData: PropTypes.func.isRequired,
};

export function BodyField({ useFormData, setUseFormData }) {
  if (useFormData) {
    return (
      <FieldArray
        name="formData"
        component={renderFormDataFields}
        setUseFormData={setUseFormData}
      />
    );
  }

  return (
    <Field
      name="data"
      component={renderDataField}
      setUseFormData={setUseFormData}
    />
  );
}

BodyField.propTypes = {
  useFormData: PropTypes.bool,
  setUseFormData: PropTypes.func.isRequired,
};

const mapStateToProps = ({ request: { useFormData } }) => ({
  useFormData,
});

export default connect(mapStateToProps, RequestActions)(BodyField);

