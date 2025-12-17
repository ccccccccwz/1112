// src/components/TaskPanel/AddProjectModal.jsx
import React from "react";
import { Modal, Form, Input, Select, Radio } from "antd";

export default function AddProjectModal({ visible, onCancel, onSubmit }) {
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
      title="新建项目"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      mask={false}          // 临时关遮罩


    >
      <Form layout="vertical" form={form}>
        <Form.Item name="dataSource" label="数据来源" initialValue="itest">
          <Radio.Group>
            <Radio value="itest">从 itest 导入</Radio>
            <Radio value="manual">手动填写</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="testGroup" label="测试组" rules={[{ required: true }]}>
          <Select placeholder="选择测试组">
            <Select.Option value="路由">路由</Select.Option>
            <Select.Option value="交换">交换</Select.Option>
            <Select.Option value="安全">安全</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="projectName" label="项目名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="projectLevel" label="项目级别" rules={[{ required: true }]}>
          <Select placeholder="选择级别">
            <Select.Option value="重要">重要</Select.Option>
            <Select.Option value="普通">普通</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="expectIssues" label="预期问题数" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="expectDI" label="预期DI" rules={[{ required: true }]}>
          <Input type="number" step="0.01" />
        </Form.Item>

      </Form>
    </Modal>
  );
}