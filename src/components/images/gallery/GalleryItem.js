// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import type { Image } from './ImageDecorator';
import GalleryItemOverlay from './GalleryItemOverlay';
import SourceSetFactory from '../../../factories/SourceSetFactory';
import './Gallery.scss';

const maxTags = 5;

type Props = {
  image: Image,
};

function GalleryItem(props: Props) {
  const { image } = props;
  const srcSet = SourceSetFactory.create(image.url, [320, 480, 640]);
  const tags = image.userTags || [];
  const displayedTags = tags.slice(0, maxTags);

  return (
    <Link to={`/images/${image.id}`} className="Gallery__item">
      <div className="Gallery__item__image-container">
        <img
          className="Gallery__item__image"
          srcSet={srcSet}
          src={image.url}
          alt={displayedTags.join(', ')}
        />
        {image.score && (
          <div className="Gallery__item__score">
            {Number(image.score).toFixed(2)}
          </div>
        )}
      </div>
      <GalleryItemOverlay image={image} maxTags={maxTags} />
    </Link>
  );
}

export default GalleryItem;
