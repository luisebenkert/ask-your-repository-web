// @flow
import React from 'react';
import shortid from 'shortid';
import { IoIosMore } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import { confirmAlert } from 'react-confirm-alert';
import Tag from '../../utility/Tag';
import type { Image } from './ImageDecorator';
import { Button } from '../../utility/buttons';
import './Gallery.scss';
import 'react-confirm-alert/src/react-confirm-alert.css';
import DeleteImageConfirmation from './DeleteImageConfirmation';

type Props = {
  image: Image,
  maxTags: number,
};

function GalleryItemOverlay(props: Props) {
  const { image, maxTags } = props;
  const tags = image.userTags || [];
  const labels = image.labelTags || [];
  const displayedTags = labels !== [] ? tags.slice(0, maxTags / 2) : tags;
  const displayedLabels = tags !== [] ? labels.slice(0, maxTags / 2) : labels;
  const showEllipses = tags.length >= maxTags;

  function handleClickDelete() {
    if (image.delete) image.delete();
  }

  function deleteImage(e: SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault();
    confirmAlert({
      customUI: ({ onClose }) => DeleteImageConfirmation({ onDelete: handleClickDelete, onClose }),
    });
  }

  return (
    <div className="Gallery__item__overlay">
      <div className="Gallery__item__overlay__labelbox">
        {displayedTags !== [] && (
          <div className="Gallery__item__overlay__labelbox__labels">
            {displayedTags.map(tag => (
              <Tag
                key={shortid.generate()}
                caption={tag}
              />
            ))}
            {showEllipses && (
              <div className="Gallery__item__ellipses">
                <IoIosMore />
              </div>
            )}
          </div>
        )}
        {displayedLabels !== [] && (
          <div>
            {displayedLabels.map(tag => (
              <Tag
                key={shortid.generate()}
                caption={tag}
              />
            ))}
            {showEllipses && (
              <div className="Gallery__item__ellipses">
                <IoIosMore />
              </div>
            )}
          </div>
        )}
      </div>
      <Button className="Gallery__item__delete" onClick={deleteImage}>
        <MdDelete />
      </Button>
    </div>
  );
}

export default GalleryItemOverlay;
