import React from 'react';
import ErrorPage from './ErrorPage';

const BadRequest = () => {
  return <ErrorPage errorCode="400" />;
};

export default BadRequest;