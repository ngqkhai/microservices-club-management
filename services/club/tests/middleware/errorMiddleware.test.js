const { errorHandler } = require('../../src/middlewares/errorMiddleware');

describe('Error Handling Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  test('should handle MongoDB duplicate key error with 409 status', () => {
    const err = new Error('Duplicate key error');
    err.name = 'MongoServerError';
    err.code = 11000;
    err.keyPattern = { name: 1 };
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      error: 'DUPLICATE_ENTITY',
      message: 'A club with this name already exists',
      field: 'name'
    });
  });
  
  test('should handle generic errors with provided status code', () => {
    const err = new Error('Not found error');
    err.name = 'NOT_FOUND';
    err.status = 404;
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      error: 'NOT_FOUND',
      message: 'Not found error'
    });
  });
  
  test('should handle generic errors with default 500 status if no status provided', () => {
    const err = new Error('Internal server error');
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: 'Error',
      message: 'Internal server error'
    });
  });
});
