// src/components/TaskPanel/AddExecutorModal.jsx
import React from "react";
import { Modal, Form, Input } from "antd";

export default function AddExecutorModal({ visible, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
        form.resetFields();
      });
  };

  return (
    <Modal
      title="新增执行人"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label="执行人姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="days" label="投入天数" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="expectedIssues" label="挑战问题数" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="expectedDI" label="挑战DI" rules={[{ required: true }]}>
          <Input type="number" step="0.01" />
        </Form.Item>
      </Form>
    </Modal>
  );
}