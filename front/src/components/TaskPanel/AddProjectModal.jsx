import React, { useState } from "react";
import { Modal, Form, Input, Select, Radio, InputNumber, DatePicker, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const API_BASE = "http://localhost:65001/api";

export default function AddProjectModal({ visible, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState("itest");
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        dataSource: dataSource,
        testgroup: values.testGroup,
        projectlevel: values.projectLevel,
        status: values.status || "进行中"
      };

      if (dataSource === "itest") {
        payload.taskId = values.taskId;
        payload.testRound = values.testRound;
        payload.expectedissues = values.expectedIssues || 0;
        payload.expecteddi = values.expectedDI || 0;
      } else {
        payload.projectname = values.projectName;
        payload.conversionFactor = values.conversionFactor || 1;
        payload.headcounts = values.headCounts || 1;
        payload.expectedissues = values.expectedIssues;
        payload.expecteddi = values.expectedDI;
        payload.AverageIssues = values.averageIssues || null;
        payload.AverageDI = values.averageDI || null;
        payload.startdate = values.startDate ? values.startDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      }

      const res = await axios.post(`${API_BASE}/projects/add_project`, payload);

      if (res.status === 201) {
        message.success("项目创建成功");
        form.resetFields();
        onSubmit();
      }
    } catch (error) {
      console.error("创建项目失败:", error);
      message.error(error.response?.data?.error || "创建项目失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDataSource("itest");
    onCancel();
  };

  return (
    <Modal
      title="新建项目"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={600}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="dataSource" label="数据来源">
          <Radio.Group value={dataSource} onChange={(e) => setDataSource(e.target.value)}>
            <Radio value="itest">从 iTest 导入</Radio>
            <Radio value="manual">手动填写</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="testGroup" label="测试组" rules={[{ required: true, message: "请选择测试组" }]}>
          <Select placeholder="选择测试组">
            <Select.Option value="路由">路由</Select.Option>
            <Select.Option value="交换">交换</Select.Option>
            <Select.Option value="安全">安全</Select.Option>
          </Select>
        </Form.Item>

        {dataSource === "itest" ? (
          <>
            <Form.Item name="taskId" label="iTest任务ID" rules={[{ required: true, message: "请输入任务ID，如T202511180041" }]}>
              <Input placeholder="例如: T202511180041" />
            </Form.Item>
            <Form.Item name="testRound" label="测试轮次" rules={[{ required: true, message: "请输入测试轮次" }]}>
              <InputNumber min={1} placeholder="1" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="expectedIssues" label="预期问题数">
              <InputNumber min={0} placeholder="留空则自动计算" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="expectedDI" label="预期DI">
              <InputNumber min={0} step={0.01} placeholder="留空则自动计算" style={{ width: "100%" }} />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: "请输入项目名称" }]}>
              <Input placeholder="输入项目名称" />
            </Form.Item>
            <Form.Item name="projectLevel" label="项目级别" rules={[{ required: true, message: "请选择项目级别" }]}>
              <Select placeholder="选择级别">
                <Select.Option value="重要">重要</Select.Option>
                <Select.Option value="普通">普通</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="conversionFactor" label="项目系数">
              <InputNumber min={0} step={0.01} placeholder="1.0" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="headCounts" label="参与人数">
              <InputNumber min={1} placeholder="1" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="expectedIssues" label="预期问题数" rules={[{ required: true, message: "请输入预期问题数" }]}>
              <InputNumber min={0} placeholder="预期问题总数" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="expectedDI" label="预期DI" rules={[{ required: true, message: "请输入预期DI" }]}>
              <InputNumber min={0} step={0.01} placeholder="预期DI总值" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="averageIssues" label="人均问题数">
              <InputNumber min={0} placeholder="留空则自动计算" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="averageDI" label="人均DI">
              <InputNumber min={0} step={0.01} placeholder="留空则自动计算" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: "请选择开始日期" }]}>
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="status" label="项目状态">
              <Select placeholder="选择状态" defaultValue="进行中">
                <Select.Option value="进行中">进行中</Select.Option>
                <Select.Option value="已完成">已完成</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}