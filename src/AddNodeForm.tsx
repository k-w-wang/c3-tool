import React, { useEffect } from "react";
import { Button, Checkbox, Form, InputNumber } from "antd";

const AddNodeForm: React.FC<{
	getFormValues: (values: Record<string, unknown>) => void;
	initData: Record<string, unknown>;
	hopIds: string[];
}> = ({ getFormValues, initData, hopIds }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue({
			...initData,
		});
	}, [initData]);

	return (
		<Form
			form={form}
			name="basic"
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 14 }}
			style={{ maxWidth: 600 }}
			onFinish={getFormValues}
			autoComplete="off"
		>
			<Form.Item
				label="HopID"
				name="HopID"
				initialValue={17}
				rules={[
					{ required: true, message: "Please input your HopID!" },
					{
						validator: async (rule, value) => {
							if (hopIds.includes(value) && initData.HopID !== value) {
								return await Promise.reject(
									new Error("此hopId已存在，请更换hopId后重试！")
								);
							}
						},
					},
				]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item
				label="NEID"
				name="NEID"
				initialValue={17001}
				rules={[{ required: true, message: "Please input your NEID!" }]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item
				label="GroupID"
				name="GroupID"
				initialValue={17}
				rules={[{ required: true, message: "Please input your GroupID!" }]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item
				label="AreaNetwork"
				name="AreaNetwork"
				initialValue={1}
				rules={[{ required: true, message: "Please input your AreaNetwork!" }]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item
				label="CostLevel"
				name="CostLevel"
				initialValue={100}
				rules={[{ required: true, message: "Please input your CostLevel!" }]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="CpuUsage"
				name={["Status", "CpuUsage"]}
				initialValue={3}
				rules={[{ required: true, message: "Please input your CpuUsage!" }]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="CpuUsage"
				name={["Status", "MemUsage"]}
				initialValue={25}
				rules={[{ required: true, message: "Please input your MemUsage!" }]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item
				label="SocketBufferUsage"
				name={["Status", "SocketBufferUsage"]}
				initialValue={0}
				rules={[
					{ required: true, message: "Please input your SocketBufferUsage!" },
				]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="UsedBandwidthIn"
				name={["Status", "UsedBandwidthIn"]}
				initialValue={2068}
				rules={[
					{ required: true, message: "Please input your UsedBandwidthIn!" },
				]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="UsedBandwidthOut"
				name={["Status", "UsedBandwidthOut"]}
				initialValue={2168}
				rules={[
					{ required: true, message: "Please input your UsedBandwidthOut!" },
				]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="TotalBandwidthIn"
				name={["Status", "TotalBandwidthIn"]}
				initialValue={5120000}
				rules={[
					{ required: true, message: "Please input your TotalBandwidthIn!" },
				]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="TotalBandwidthOut"
				name={["Status", "TotalBandwidthOut"]}
				initialValue={5120000}
				rules={[
					{ required: true, message: "Please input your TotalBandwidthOut!" },
				]}
			>
				<InputNumber controls={false} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				label="isPub"
				name="isPub"
				valuePropName="checked"
				initialValue={false}
				rules={[
					{ required: false, message: "Please input your TotalBandwidthOut!" },
				]}
			>
				<Checkbox />
			</Form.Item>

			<Form.Item
				label="isSub"
				name="isSub"
				valuePropName="checked"
				initialValue={false}
				rules={[
					{ required: false, message: "Please input your TotalBandwidthOut!" },
				]}
			>
				<Checkbox />
			</Form.Item>

			<Form.Item wrapperCol={{ offset: 18, span: 6 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};
export default AddNodeForm;
