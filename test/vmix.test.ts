import axios from 'axios';
import { VMix, isVMixStreamingNode } from '../src/vmix';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('', () => {
  it('should get default vmix state', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: vmixDefaultResponse,
    });
    const vmix = new VMix({
      apiUrl: 'http://my.host1:8088',
    });
    const state = await vmix.getCurrentState();
    expect(state).not.toBeNull();

    if (state == null) {
      expect(false).toBeTruthy();
      return;
    }
    expect(state.vmix.version).toBe('24.0.0.51');
    expect(state.vmix.inputs.input[0].type).toBe('Blank');
    expect(state.vmix.active).toBe('1');
    expect(state.vmix.streaming).toBe('False');
  });
  it('should get 1 stream channel', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: vmixResponse1OutputStream,
    });
    const vmix = new VMix({
      apiUrl: 'http://my.host1:8088',
    });
    const state = await vmix.getCurrentState();
    expect(state).not.toBeNull();

    if (state == null) {
      expect(false).toBeTruthy();
      return;
    }
    if (isVMixStreamingNode(state.vmix.streaming)) {
      expect(state.vmix.streaming.channel1).toBe('True');
    } else {
      expect(false).toBeTruthy();
    }
  });
});

export const vmixDefaultResponse = `<vmix>
<version>24.0.0.51</version>
<edition>4K</edition>
<inputs>
  <input key="4388cc92-2915-47e2-9ef0-8fec0d748b6f" number="1" type="Blank" title="Blank" shortTitle="Blank" state="Paused" position="0" duration="0" loop="False">Blank</input>
  <input key="a2445db8-411c-4e7d-bc85-2a2ad071ebd2" number="2" type="Blank" title="Blank" shortTitle="Blank" state="Paused" position="0" duration="0" loop="False">Blank</input>
</inputs>
<overlays>
  <overlay number="1" />
  <overlay number="2" />
  <overlay number="3" />
  <overlay number="4" />
  <overlay number="5" />
  <overlay number="6" />
  <overlay number="7" />
  <overlay number="8" />
</overlays>
<preview>2</preview>
<active>1</active>
<fadeToBlack>False</fadeToBlack>
<transitions>
  <transition number="1" effect="Fade" duration="500" />
  <transition number="2" effect="Merge" duration="1000" />
  <transition number="3" effect="Wipe" duration="1000" />
  <transition number="4" effect="CubeZoom" duration="1000" />
</transitions>
<recording duration="12" filename1="C:\Users\my\Videos\vMix-Record\2021.10.05-22.02-MY-PC-20211001_test01\archive_dirty - 15.10.2021-10-07-32.mp4" filename2="C:\Users\my\Videos\vMix-Record\2021.10.05-22.02-MY-PC-20211001_test01\archive_clean - 15.10.2021-10-07-32 - Output 1.mp4">True</recording>
<external>False</external>
<streaming>False</streaming>
<playList>False</playList>
<multiCorder>False</multiCorder>
<fullscreen>False</fullscreen>
<audio>
  <master volume="100" muted="False" meterF1="0" meterF2="0" headphonesVolume="100" />
</audio>
<dynamic>
  <input1></input1>
  <input2></input2>
  <input3></input3>
  <input4></input4>
  <value1></value1>
  <value2></value2>
  <value3></value3>
  <value4></value4>
</dynamic>
</vmix>`;

export const vmixResponse1OutputStream = `<vmix>
<version>24.0.0.51</version>
<edition>4K</edition>
<inputs>
  <input key="4388cc92-2915-47e2-9ef0-8fec0d748b6f" number="1" type="Blank" title="Blank" shortTitle="Blank" state="Paused" position="0" duration="0" loop="False">Blank</input>
  <input key="a2445db8-411c-4e7d-bc85-2a2ad071ebd2" number="2" type="Blank" title="Blank" shortTitle="Blank" state="Paused" position="0" duration="0" loop="False">Blank</input>
</inputs>
<overlays>
  <overlay number="1" />
  <overlay number="2" />
  <overlay number="3" />
  <overlay number="4" />
  <overlay number="5" />
  <overlay number="6" />
  <overlay number="7" />
  <overlay number="8" />
</overlays>
<preview>2</preview>
<active>1</active>
<fadeToBlack>False</fadeToBlack>
<transitions>
  <transition number="1" effect="Fade" duration="500" />
  <transition number="2" effect="Merge" duration="1000" />
  <transition number="3" effect="Wipe" duration="1000" />
  <transition number="4" effect="CubeZoom" duration="1000" />
</transitions>
<recording>False</recording>
<external>False</external>
<streaming channel1="True">True</streaming>
<playList>False</playList>
<multiCorder>False</multiCorder>
<fullscreen>False</fullscreen>
<audio>
  <master volume="100" muted="False" meterF1="0" meterF2="0" headphonesVolume="100" />
</audio>
<dynamic>
  <input1></input1>
  <input2></input2>
  <input3></input3>
  <input4></input4>
  <value1></value1>
  <value2></value2>
  <value3></value3>
  <value4></value4>
</dynamic>
</vmix>`;
