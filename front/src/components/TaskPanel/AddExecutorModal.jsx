import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import axios from "axios";

const API_BASE = "http://localhost:65001/api";

export default function AddExecutorModal({ visible, onCancel, onSubmit, projectId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        projectID: projectId,
        executorName: values.name,
        days: values.days,
        expectedIssues: values.expectedIssues,
        expectedDI: values.expectedDI
      };

      const res = await axios.post(`${API_BASE}/executors/add_executor`, payload);

      if (res.status === 201 || res.status === 200) {
        message.success("执行人添加成功");
        form.resetFields();
        onSubmit();
      }
    } catch (error) {
      console.error("添加执行人失败:", error);
      message.error(error.response?.data?.error || "添加执行人失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新增执行人"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label="执行人姓名" rules={[{ required: true, message: "请输入执行人姓名" }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="days" label="投入天数" rules={[{ required: true, message: "请输入投入天数" }]}>
          <Input placeholder="ADCP任务15天，其他10天" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="expectedIssues" label="挑战问题数" rules={[{ required: true, message: "请输入挑战问题数" }]}>
          <Input placeholder="预期问题数" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="expectedDI" label="挑战DI" rules={[{ required: true, message: "请输入挑战DI" }]}>
          <Input placeholder="预期DI值" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
