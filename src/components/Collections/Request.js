import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import { ListGroup } from 'react-bootstrap';
import flow from 'lodash.flow';

import IconButton from 'components/IconButton';
import * as Actions from 'store/collections/actions';

import { StyledRequest, AsideButtons, MainContent } from './StyledComponents';
import * as Type from './dropTypes';

/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
const requestSource = {
  canDrag() {
    // TODO Disallow drag if editing name
    return true;
  },

  beginDrag({ id, index, collectionIndex }) {
    return { id, index, collectionIndex };
  },
};

const requestTarget = {
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const dragCollectionIndex = monitor.getItem().collectionIndex;
    const dragUUID = monitor.getItem().id;
    const hoverIndex = props.index;
    const hoverCollectionIndex = props.collectionIndex;
    const hoverUUID = props.id;

    // Abort further processing if dragged item is hovering over itself
    if (dragUUID === hoverUUID) {
      return;
    }

    // Note: we're mutating the monitor item here.
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    /* eslint-disable no-param-reassign */
    monitor.getItem().index = hoverIndex;
    monitor.getItem().collectionIndex = hoverCollectionIndex;
    /* eslint-enable no-param-reassign */

    // Update redux orders
    props.reorderRequest({
      // Source
      collectionIndex: dragCollectionIndex,
      requestIndex: dragIndex,
    }, {
      // Target
      collectionIndex: hoverCollectionIndex,
      requestIndex: hoverIndex,
    });
  },
};

class Request extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    index: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    collectionIndex: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    renameRequest: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.toggleCompact = this.toggleCompact.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.renameRequest = this.renameRequest.bind(this);
  }

  state = {};

  toggleCompact() {
    this.setState({ compact: !this.state.compact });
  }

  toggleEdit() {
    this.setState({ edit: !this.state.edit });
  }

  renameRequest(e) {
    const { collectionIndex, index, renameRequest } = this.props;
    e.preventDefault();

    this.setState({ edit: false });
    renameRequest(collectionIndex, index, this.nameRef.value);
  }

  render() {
    const { compact, edit } = this.state;
    const {
      connectDragSource,
      connectDropTarget,
      isDragging,
      id,
      collectionIndex,
      method,
      name,
      url,
      deleteRequest,
    } = this.props;

    return connectDragSource(connectDropTarget(
      <div> {/* Need a wrapper div for React DnD support */}
        <StyledRequest isDragging={isDragging}>
          <ListGroup componentClass="div">
            <div className="list-group-item">
              <AsideButtons compact={compact}>
                {!compact && (
                  <IconButton
                    tooltip="Toggle edit"
                    icon="cog"
                    onClick={this.toggleEdit}
                  />
                )}
                {compact && (
                  <IconButton
                    tooltip="Expand"
                    icon="plus"
                    onClick={this.toggleCompact}
                  />
                )}

                {!compact && !edit && (
                  <IconButton
                    tooltip="Minimize"
                    icon="minus"
                    onClick={this.toggleCompact}
                  />
                )}
                {!compact && edit && (
                  <IconButton
                    tooltip="Delete"
                    icon="trash"
                    onClick={() => deleteRequest(id, collectionIndex)}
                  />
                )}
              </AsideButtons>

              <MainContent compact={compact}>
                {!compact && <h4>{method}</h4>}
                {edit ? (
                  <form onSubmit={this.renameRequest}>
                    <input
                      defaultValue={name}
                      ref={ref => { this.nameRef = ref; }}
                    />
                    <IconButton
                      tooltip="Save"
                      icon="check"
                    />
                  </form>
                ) : (
                  name || url
                )}
              </MainContent>
            </div>
          </ListGroup>
        </StyledRequest>
      </div>,
    ));
  }
}

export default flow(
  DropTarget(Type.Request, requestTarget, connector => ({
    connectDropTarget: connector.dropTarget(),
  })),
  DragSource(Type.Request, requestSource, (connector, monitor) => ({
    connectDragSource: connector.dragSource(),
    isDragging: monitor.isDragging(),
  })),
  connect(null, Actions),
)(Request);

