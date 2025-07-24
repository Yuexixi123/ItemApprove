/**
 * 模拟数据提供者
 */
export class MockDataProvider {
  /**
   * 获取模拟系统数据
   */
  static getSystemMockData() {
    return [
      {
        value: '224',
        id: '224',
        label: 'ACS综合前置子系统',
        name: 'ACS综合前置子系统',
        status: 1,
        is_information: 1,
      },
      {
        value: '56',
        id: '56',
        label: 'ATMP系统/天燃气充值系统',
        name: 'ATMP系统/天燃气充值系统',
        status: 1,
        is_information: 0,
      },
      {
        value: '363',
        id: '363',
        label: 'ATM密码锁系统',
        name: 'ATM密码锁系统',
        project_leader: '000197',
        status: 1,
        is_information: 1,
      },
      {
        value: '350',
        id: '350',
        label: 'CFCA预制证书前置系统',
        name: 'CFCA预制证书前置系统',
        status: 1,
        is_information: 1,
      },
      {
        value: '273',
        id: '273',
        label: 'ComStar资金业务管理系统/CMDS数据接收平台',
        name: 'ComStar资金业务管理系统/CMDS数据接收平台',
        status: 1,
        is_information: 1,
      },
      // ... 其他系统数据
    ];
  }

  /**
   * 根据系统ID获取模拟主机数据
   */
  static getHostMockData(systemId: string | number) {
    if (systemId === '56' || systemId === 56) {
      return [
        { label: 'ATMP应用主161', value: '10183' },
        { label: 'ATMP应用备162', value: '10210' },
        { label: 'ATMP管理', value: '10291' },
        { label: 'ATMP交易监控', value: '10867' },
        { label: '国密ATMP服务器', value: '10964' },
        { label: 'ATMP报表', value: '11643' },
        { label: 'ATMP应用服务器1-信创', value: '12517' },
        { label: 'ATMP应用服务器2-信创', value: '12516' },
      ];
    } else if (systemId === '363' || systemId === 363) {
      return [
        { label: 'ATM设备电子密码锁管理系统', value: '11036' },
        { label: '自助设备电子密码锁系统应用服务器', value: '11616' },
      ];
    } else {
      return [
        { label: '默认主机1', value: '10001' },
        { label: '默认主机2', value: '10002' },
      ];
    }
  }
}
