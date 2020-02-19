import shutil, time, os, datetime, sys

from app.torrent.utorrentapi import UTorrentAPI
from app.config import Config
from app.fileManager import FileManager
from dateutil.relativedelta import relativedelta

from app.torrent.tfreeca import Tfreeca
# https://bitbucket.org/jochangmin/hacked-urllib2/src/master/


class TorrentController:
    def __init__(self, queue):
        self.queue = queue;
        self.configure = Config()
        self.file_manager = FileManager();

    def sendMsg(self, msg):
        self.queue.put(msg)

    def organizeUploadedFiles(self, target_dir):
        for t in os.listdir(target_dir):
            if t == 'thumnail' : continue

            try :
                r = str(self.file_manager.searchLine('up_list.txt', t))
                d = r.split('|')

                c_date_obj = datetime.datetime.strptime(d[1], '%Y%m%d%H%M')
                # c_date_obj = datetime.datetime(int(d[1][:4]), int(d[1][5:6]), int(d[1][7:8]))
                t_diff = relativedelta(datetime.date.today(), c_date_obj)

                if d and t_diff.days > 2 :
                    os.remove(target_dir + '/' + t)
                    # self.file_manager.delLine('up_list.txt', t)
                    # self.file_manager.delLine('download.txt', t)
            except Exception as e:
                self.file_manager.append('log.txt',
                                         datetime.datetime.today().strftime("%Y/%m/%d %H:%M:%S") + ' 파일삭제 - ' + str(e))

    def run(self, params):
        apiclient = None
        key_except = []
        torrents = []

        # 파일 및 텍스트 파일 정리 로직 추가
        self.organizeUploadedFiles(params['target_dir'])

        try :
            self.apiclient = UTorrentAPI(  # torrent info
                'http://127.0.0.1:' + self.configure.config_parser['INFO']['torrent_port'] + '/gui',
                self.configure.config_parser['INFO']['torrent_id'],
                self.configure.config_parser['INFO']['torrent_password']
            );
            key_except = (self.configure.config_parser['INFO']['except_keyword']).split('/');
            torrents = (self.configure.config_parser['INFO']['use_torrent']).split('/');
        except Exception as e:
            self.file_manager.append('log.txt', datetime.datetime.today().strftime("%Y/%m/%d %H:%M:%S")+' 토렌트 실행 불가 - ' + str(e))

        if self.apiclient and self.apiclient.token is 0 :
            self.sendMsg('토렌트가 실행되어 있지 않거나 설정이 되어있지 않아 다운로드를 종료합니다.');
            return False

        # 토렌트 시드 삭제 및 파일/폴더를 카테고리 폴더로 분류
        self.removeSeedAndMoveFile2Category(self.apiclient, params);

        # 토렌트 사이트별 크롤링 및 시드 추가
        for site in torrents :
            try:
                self.sendMsg('[프리미엄] ' + str(site) + ' 사이트에서 다운로드를 진행합니다.');

                download_site = self.configure.config_parser['INFO'][site];

                target_site = eval(str(site).capitalize())(download_site)

                l = target_site.getSeedList({
                    'key_except': key_except,
                    'params': params,
                })

                for item in l:  # 마그넷 리스트를 받아와 그대로 반복문에서 토렌트에 삽입
                    item.update(params)
                    if target_site.isAddItemInTorrent(item['margnet']):
                        self.addItem2Torrent(item)
                        time.sleep(1)
            except Exception as e:
                self.file_manager.append('log.txt', datetime.datetime.today().strftime("%Y/%m/%d %H:%M:%S")+' 크롤링 및 시드추가 - '+str(e))
                continue

        return self.sendMsg('[프리미엄] 토렌트 시드 추가를 완료하였습니다.');

    def addItem2Torrent(self, data):
        string = ''

        or_magnet = data['margnet'].replace('magnet:?xt=urn:btih:', '');
        string += time.strftime('%Y%m%d-%H:%M')

        for key, value in data.items() :
            string += '|'+str(value).replace('™', '').replace('\'', '').replace(' 外', '')

        string.replace('+', ' ')

        self.apiclient.add_url(data['margnet'])  # 시드 추가
        self.file_manager.append('download.txt', string)

    def removeSeedAndMoveFile2Category(self, apiclient,  params) :
        torrents = apiclient.get_list()

        if len(torrents) > 0 :
            self.sendMsg('[프리미엄] 토렌트 시드 제거하고 파일을 분류 합니다.');

        for torrent in torrents['torrents']: # 시드 삭제후 지정된 카테고리를 받아와 폴더이동
            t_diff = relativedelta(datetime.datetime.fromtimestamp(int(torrent[23])), datetime.date.today())

            if 'Error' in torrent[21] :
                apiclient.remove(torrent[0])
                continue

            # if int(torrent[4]) == 0 and  int(torrent[5]) == 0 and 'Downloading' in torrent[21] :
            #     apiclient.remove(torrent[0])
            #     continue

            if (torrent[18] > 4500000000) : # 용량이 4.5gb 보다 클때 시드 삭제
                apiclient.removedata(torrent[0])
                continue

            if t_diff.hours > 72:  # 3일 경과시 리스트에서 삭제
                apiclient.removedata(torrent[0])
                continue

            # if (torrent[21] == 'Seeding 100.0 %'):
            if torrent[4] == 1000 :
                file_data = self.file_manager.searchLine('download.txt', str(torrent[0]).upper())

                if not file_data :  # 마그넷 소문자 비교
                    file_data = self.file_manager.searchLine('download.txt', str(torrent[0]).lower())

                if not file_data : # 텍스트 파일에 없고 시드만 있을 경우
                    apiclient.removedata(torrent[0]);
                    continue

                file_data = str(file_data[0]).strip()
                file_data_arr = file_data.split('|') # 파일정보 검색

                if params['category_name'] != file_data_arr[5] :
                    continue

                if os.path.isdir(torrent[26]) : # 폴더
                    t_path = torrent[26].split('\\')
                    t_path.pop()
                    t_path.append(file_data_arr[5])
                    t_path.append(torrent[2])
                    pre_path = torrent[26]
                    next_path = '/'.join(t_path)

                if os.path.isfile(torrent[26] + '/' + torrent[2]) : # 파일
                    pre_path = torrent[26] + '/' + torrent[2]
                    next_path = torrent[26] + '/' + file_data_arr[5] + '/' + torrent[2]

                # 시드 삭제
                apiclient.remove(torrent[0]);
                time.sleep(0.5);

                # 폴더가 없을 경우 폴더생성
                if not os.path.isdir(file_data_arr[6]) :
                    os.mkdir(file_data_arr[6])

                # 파일 및 폴더 이동
                try :
                    shutil.move(pre_path, next_path)
                except :
                    pass

