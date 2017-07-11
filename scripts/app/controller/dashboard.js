app
    .controller('DashboardController', function ($scope, RestService, $cookieStore, $mdDialog, $location) {
        $scope.items = [
            {
                header: 'سامانه‌های جستجو',
                icon : 'pp_icons_semantic_search',
                cssClass : 'icon-search',
                links: [
                    {title: 'جستجو', url: 'http://dmls.iust.ac.ir/search/html/index.html'},
                    {title: 'افزودن الگو', url: ''},
                    {title: 'ارزیابی جستجو', url: 'http://dmls.iust.ac.ir/evaluation/'}
                ],
            },
            {
                header: 'سامانه‌های نگاشت',
                icon : 'pp_icons_IT_Consulting',
                cssClass : 'icon-mappings',
                links: [
                    {title: 'نگاشت خصیصه', url: 'http://dmls.iust.ac.ir/mapping/html/property-mapping.html'},
                    {title: 'نگاشت الگو', url: 'http://dmls.iust.ac.ir/mapping/html/template-mapping.html'},
                    {title: 'سامانه نگاشت', url: 'http://dmls.iust.ac.ir/mapping/html/mappings.html'},
                ],
            },
            {
                header: 'سامانه‌های هستان‌شناسی',
                icon : 'pp_icons_ontologie',
                cssClass : 'icon-ontology',
                links: [
                    {title: 'ترجمه هستان‌شناسی', url: 'http://dmls.iust.ac.ir/mapping/html/index.html'},
                    {title: 'مدیریت هستان‌شناسی', url: '#!/ontology/tree'},
                    {title: 'نمایش هستان‌شناسی ۱', url: 'http://dmls.iust.ac.ir/Ontology/1/'},
                    {title: 'نمایش هستان‌شناسی ۲', url: 'http://dmls.iust.ac.ir/Ontology/2/'},
                ],
            },
            {
                header: 'منابع گراف دانش',
                icon : 'pp_icons_Data_Analysis',
                cssClass : 'icon-resources',
                links: [
                    {title: 'نمایش منابع', url: 'http://dmls.iust.ac.ir/mapping/html/triples.html'}
                ],
            },
            {
                header: 'گراف دانش',
                icon : 'pp_icons_data_linking',
                cssClass : 'icon-knowledge-graph',
                links: [
                    {title: 'مخزن سه‌تایی ویرتوسو', url: 'http://dmls.iust.ac.ir:8890/conductor/'},
                    {title: 'SPARQL', url: 'http://dmls.iust.ac.ir:8890/sparql'}
                ],
            },
            {
                header: 'سامانه‌های خبرگان',
                icon : 'pp_icons_Information_Architect',
                cssClass : 'icon-experts',
                links: [
                    {title: 'نظارت سه‌تایی‌ها', url: 'http://dmls.iust.ac.ir/expert/'},
                    {title: 'مدیریت کاربران', url: 'http://dmls.iust.ac.ir/ui'},
                    {title: 'پنل ادمین', url: ''}
                ],
            },
            {
                header: 'سامانه‌های متن خام',
                icon : 'pp_icons_textanalyse',
                cssClass : 'icon-raw-text',
                links: [
                    {title: 'سامانه متن خام', url: 'http://dmls.iust.ac.ir/raw/'}
                ],
            }
        ];
    });
