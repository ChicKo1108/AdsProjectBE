/**
 * 通用API响应工具函数
 * 用于统一处理所有API的响应格式，确保包含success字段
 */

class ResponseUtils {
  /**
   * 成功响应
   * @param {Object} res - Express响应对象
   * @param {number} statusCode - HTTP状态码，默认200
   * @param {string} message - 响应消息
   * @param {*} data - 响应数据
   * @param {number} code - 业务状态码，默认与HTTP状态码相同
   */
  static success(res, statusCode = 200, message = '操作成功', data = null, code = null) {
    const responseCode = code || statusCode;
    return res.status(statusCode).json({
      code: responseCode,
      success: true,
      message,
      data
    });
  }

  /**
   * 错误响应
   * @param {Object} res - Express响应对象
   * @param {number} statusCode - HTTP状态码，默认400
   * @param {string} message - 错误消息
   * @param {*} data - 响应数据，默认null
   * @param {number} code - 业务状态码，默认与HTTP状态码相同
   */
  static error(res, statusCode = 400, message = '操作失败', data = null, code = null) {
    const responseCode = code || statusCode;
    return res.status(statusCode).json({
      code: responseCode,
      success: false,
      message,
      data
    });
  }

  /**
   * 创建响应 - 201状态码
   * @param {Object} res - Express响应对象
   * @param {string} message - 响应消息
   * @param {*} data - 响应数据
   */
  static created(res, message = '创建成功', data = null) {
    return this.success(res, 201, message, data, 201);
  }

  /**
   * 未授权响应 - 401状态码
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} data - 响应数据
   */
  static unauthorized(res, message = '未授权访问', data = null) {
    return this.error(res, 401, message, data, 401);
  }

  /**
   * 权限不足响应 - 403状态码
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} data - 响应数据
   */
  static forbidden(res, message = '权限不足', data = null) {
    return this.error(res, 403, message, data, 403);
  }

  /**
   * 资源未找到响应 - 404状态码
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} data - 响应数据
   */
  static notFound(res, message = '资源未找到', data = null) {
    return this.error(res, 404, message, data, 404);
  }

  /**
   * 服务器内部错误响应 - 500状态码
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} data - 响应数据
   */
  static serverError(res, message = '服务器内部错误', data = null) {
    return this.error(res, 500, message, data, 500);
  }

  /**
   * 参数验证错误响应 - 400状态码
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} data - 响应数据
   */
  static badRequest(res, message = '请求参数错误', data = null) {
    return this.error(res, 400, message, data, 400);
  }
}

module.exports = ResponseUtils;