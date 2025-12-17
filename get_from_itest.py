# coding:utf-8
import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_token():
    url = 'https://itest-api.h3c.com/testwing/getToken'
    data = {
        "account": "c23566",
        "password": "Cwz9601231",
    }

    response = requests.post(url, json=data)
    # 解析 JSON 响应
    response_data = response.json()

    # 提取 data 中的 token
    token = response_data["msg"]
    return token

headers = {
        "Host": "itest-api.h3c.com",
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Authorization": get_token(),
        "Content-Type": "application/json",
        "Origin": "https://itest.h3c.com",
        "Referer": "https://itest.h3c.com/",
        "Sec-Ch-Ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
    }

def get_project_info(task_code):
    result = {}
    url = "https://itest-api.h3c.com/testwing/tdpexecute/task/tree"

    # 正确参数（注意路径要和 URL 一致）
    payload = {"ibdsProdLine":None,"ibdsProduct":None,"libraryId":"1752266016873594881","pageNum":1,"pageSize":1000,"orderByDtos":[],"conditions":[],"myHandler":False}
    # 标准化请求头（移除 HTTP/2 伪头字段）

    response = requests.post(
        url,
        json=payload,  # 自动设置 Content-Type 为 application/json
        headers=headers,
        verify=False  # 如果证书有问题可临时关闭验证（生产环境不推荐）
    )
    # 解析 JSON 响应
    response_data = response.json()
    # print("响应内容:", response_data['data']['records'])
    # task_code = "T202506050087"
    for item in response_data['data']['records']:
        if item['code'] == task_code:
            """
            1752266016873594881 
             1930556559001714689 
             安全生态A2000 E6115P01版本鉴定测试 
             进行中 
             2025-06-06
            """
            # print(item)
            # print(item['libraryId'],'\n', item['taskId'], '\n', item['name'], '\n', item['taskStatus'], '\n', item['actualStartTime'])
            result['name'] = item['name']
            result['task_id'] = item['taskId']
            result['start_time'] = item['actualStartTime']
            print(f"Type of data: {type(result)}")
            print(result)
            return result


def get_person_idms(task_id, round):
    task_detail_url = "https://itest-api.h3c.com/testwing/tdpexecute/report/round/info"
    # task_detail_payload = {"libraryId":"1752266016873594881","taskId":"1930556559001714689","round":1}
    task_detail_payload = {"libraryId": "1752266016873594881", "taskId": task_id, "round": round}

    try:
        response = requests.post(
            url=task_detail_url,
            json=task_detail_payload,  # 自动设置 Content-Type 为 application/json
            headers=headers,
            verify=False  # 如果证书有问题可临时关闭验证（生产环境不推荐）
        )
        # 打印原始响应和状态码
        print(f"Response status code: {response.status_code}")
        print(f"Raw response text: {response.text}")
        print("="*20)
        # 解析 JSON 响应
        response_data = response.json()
        print(response_data['data']['report']['contentReviewerIdms'])
        print("=" * 20)
        print(response_data['data']['report']['contentReviewerIdms']['data'])
        print("=" * 20)

        # 检查响应结构
        if not response_data.get('data', {}).get('report', {}).get('contentReviewerIdms', {}).get('data'):
            print(f"Unexpected API response structure:{response_data}")
            return {}
        result = {}

        for item in response_data['data']['report']['contentReviewerIdms']['data']:
            reviewer = item['reviewer'][0].split()[0]  # 提取reviewer的名字（假设列表只有1个元素）
            values = []
            for key in ['value0','value1', 'value2', 'value3', 'value4', 'value5']:
                val = item[key]
                if val == '-':
                    values.append(0)
                else:
                    # 尝试先转为整数，失败再转浮点数
                    try:
                        num = int(val)
                        values.append(num)
                    except ValueError:
                        try:
                            num = float(val)
                            values.append(num)
                        except ValueError:
                            values.append(0)  # 其他无效值也置为0
            result[reviewer] = values

        # print(result)
        return result
    except Exception as e:
        print(f"获取人员信息出错，错误信息: {e}")
        return {}


def get_task_factor(task_id):
    detail_url = "https://itest-api.h3c.com/testwing/tdpexecute/task/details"
    detail_payload = {"libraryId": "1752266016873594881", "taskId": task_id}

    try:
        response = requests.post(
            url=detail_url,
            json=detail_payload,  # 自动设置 Content-Type 为 application/json
            headers=headers,
            verify=False  # 如果证书有问题可临时关闭验证（生产环境不推荐）
        )
        # 解析 JSON 响应
        response_data = response.json()
        print(response_data['data']['task'])

        return response_data['data']['task']['diProduct'], response_data['data']['task']['taskTypeCheck']
    except Exception as e:
        print(f"Error getting task factor for task_id {task_id}: {str(e)}")
        print(f"Response content: {response.text if 'response' in locals() else 'No response'}")
        return None, None  # 或者抛出异常



if __name__ == "__main__":
    task_id = get_project_info("T202511180041")['task_id'] #T202507030026  T202507040017
    print(task_id)
    # task_name = get_project_info("T202507020035")['name']  # 安全生态A2000 E6115P01版本鉴定测试
    # task_start_time = get_project_info("T202507020035")['start_time']  # 2025-06-06
    # # print(task_name, task_start_time)
    get_person_idms(task_id, 1)  # {'葛延放': [5.76, 1, 3, 5, 0], '张香宁': [2.76, 0, 2, 5, 1], '蔡文哲': [1.2, 0, 1, 2, 0], '吴哈申其其格': [1.08, 0, 1, 1, 1], '刘旭': [0.72, 0, 0, 2, 2], '杨华': [0.36, 0, 0, 1, 1], '桑鲁静': [0.24, 0, 0, 1, 0]}
    print(get_person_idms(task_id, 1))
    # get_task_factor(task_id)  # 0.24